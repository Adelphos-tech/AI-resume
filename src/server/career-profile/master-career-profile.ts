import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import {
  MASTER_CAREER_PROFILE_SCHEMA_VERSION,
  isWithinProfileSizeLimit,
  masterCareerProfileSchema,
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
      careerProfile: {
        select: { schemaVersion: true, profileData: true, updatedAt: true },
      },
    },
  });
  return candidate;
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
