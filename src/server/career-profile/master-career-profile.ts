import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import {
  MASTER_CAREER_PROFILE_SCHEMA_VERSION,
  createInitialMasterCareerProfileFromCandidate,
  isWithinProfileSizeLimit,
  masterCareerProfileBasicsSchema,
  masterCareerProfileSchema,
  masterCareerProfileWorkSchema,
  type MasterCareerProfileData,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

const candidateIdSchema = z.cuid();

export type GetMasterCareerProfileResult =
  | {
      success: true;
      profile: MasterCareerProfileData | null;
      schemaVersion: number | null;
      updatedAt: Date | null;
    }
  | { success: false; message: string };

export type UpsertMasterCareerProfileResult =
  | { success: true; schemaVersion: number; updatedAt: Date }
  | { success: false; message: string };

async function findProfileContext(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      location: true,
      linkedinUrl: true,
      careerProfile: {
        select: { schemaVersion: true, profileData: true, updatedAt: true },
      },
    },
  });
  return candidate;
}

type ProfileContext = NonNullable<
  Awaited<ReturnType<typeof findProfileContext>>
>;

/**
 * The canonical base document a section save merges into: the current
 * revalidated profile, or the deterministic Candidate-derived initial
 * draft when no profile row exists yet (so a section-first save never
 * produces empty Basics).
 */
function resolveBaseProfile(
  candidate: ProfileContext,
): MasterCareerProfileData | { error: string } {
  const row = candidate.careerProfile;
  if (!row) {
    return createInitialMasterCareerProfileFromCandidate(candidate);
  }
  if (row.schemaVersion !== MASTER_CAREER_PROFILE_SCHEMA_VERSION) {
    return { error: "Unsupported profile schema version." };
  }
  const parsed = masterCareerProfileSchema.safeParse(row.profileData);
  if (!parsed.success) {
    return { error: "Stored profile data is invalid." };
  }
  return parsed.data;
}

export async function getMasterCareerProfile(
  candidateId: string,
): Promise<GetMasterCareerProfileResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const candidate = await findProfileContext(parsedId.data);
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }

  const row = candidate.careerProfile;
  if (!row) {
    return {
      success: true,
      profile: null,
      schemaVersion: null,
      updatedAt: null,
    };
  }

  if (row.schemaVersion !== MASTER_CAREER_PROFILE_SCHEMA_VERSION) {
    return {
      success: false,
      message: "Unsupported profile schema version.",
    };
  }

  // JSONB does not guarantee shape — revalidate on every read.
  const parsed = masterCareerProfileSchema.safeParse(row.profileData);
  if (!parsed.success) {
    return { success: false, message: "Stored profile data is invalid." };
  }

  return {
    success: true,
    profile: parsed.data,
    schemaVersion: row.schemaVersion,
    updatedAt: row.updatedAt,
  };
}

/**
 * Basics-only write boundary. The browser submits only the basics section;
 * the server loads the current canonical profile, replaces just `.basics`,
 * revalidates the COMPLETE document, and persists it — so unrelated
 * sections can never be wiped by a partial form payload.
 */
export async function updateMasterCareerProfileBasics(
  candidateId: string,
  rawBasics: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const parsedBasics = masterCareerProfileBasicsSchema.safeParse(rawBasics);
  if (!parsedBasics.success) {
    return { success: false, message: "Profile data is invalid." };
  }

  const candidate = await findProfileContext(parsedId.data);
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }

  const base = resolveBaseProfile(candidate);
  if ("error" in base) {
    return { success: false, message: base.error };
  }

  // upsertMasterCareerProfile revalidates the merged document and enforces
  // the size cap before persisting.
  return upsertMasterCareerProfile(candidateId, {
    ...base,
    basics: parsedBasics.data,
  });
}

/**
 * Work-only write boundary — same merge semantics as the basics boundary:
 * the browser submits only the canonical work array; the server replaces
 * just `.work` on the current (or freshly initialized) document and
 * revalidates the complete profile before persisting.
 */
export async function updateMasterCareerProfileWork(
  candidateId: string,
  rawWork: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const parsedWork = masterCareerProfileWorkSchema.safeParse(rawWork);
  if (!parsedWork.success) {
    return { success: false, message: "Profile data is invalid." };
  }

  const candidate = await findProfileContext(parsedId.data);
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }

  const base = resolveBaseProfile(candidate);
  if ("error" in base) {
    return { success: false, message: base.error };
  }

  return upsertMasterCareerProfile(candidateId, {
    ...base,
    work: parsedWork.data,
  });
}

export async function upsertMasterCareerProfile(
  candidateId: string,
  rawProfile: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: parsedId.data },
    select: { id: true },
  });
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }

  const parsed = masterCareerProfileSchema.safeParse(rawProfile);
  if (!parsed.success) {
    return { success: false, message: "Profile data is invalid." };
  }

  if (!isWithinProfileSizeLimit(parsed.data)) {
    return { success: false, message: "Profile data is too large." };
  }

  const record = await prisma.masterCareerProfile.upsert({
    where: { candidateId: parsedId.data },
    create: {
      candidateId: parsedId.data,
      schemaVersion: MASTER_CAREER_PROFILE_SCHEMA_VERSION,
      profileData: parsed.data as Prisma.InputJsonValue,
    },
    update: {
      schemaVersion: MASTER_CAREER_PROFILE_SCHEMA_VERSION,
      profileData: parsed.data as Prisma.InputJsonValue,
    },
    select: { schemaVersion: true, updatedAt: true },
  });

  return {
    success: true,
    schemaVersion: record.schemaVersion,
    updatedAt: record.updatedAt,
  };
}
