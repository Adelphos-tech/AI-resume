import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import {
  MASTER_CAREER_PROFILE_SCHEMA_VERSION,
  createInitialMasterCareerProfileFromCandidate,
  isWithinProfileSizeLimit,
  masterCareerProfileBasicsSchema,
  masterCareerProfileCertificationsSchema,
  masterCareerProfileEducationSchema,
  masterCareerProfileLanguagesSchema,
  masterCareerProfileProjectsSchema,
  masterCareerProfileSchema,
  masterCareerProfileSkillsSchema,
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

/**
 * Authorization-free core: callers MUST enforce their own session/ownership
 * boundary before invoking. Admin wrappers enforce requireInternalSession();
 * candidate wrappers enforce requireCandidateSession() and pass the
 * session-owned candidate id.
 */
export async function getMasterCareerProfileCore(
  candidateId: string,
): Promise<GetMasterCareerProfileResult> {
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
 * Shared section-merge write boundary: validates only the submitted
 * section, merges it into the CURRENT canonical profile (or the
 * deterministic Candidate-derived initial draft), revalidates the
 * complete document via upsertMasterCareerProfile, and persists it.
 * A partial payload can never wipe unrelated sections.
 */
async function updateProfileSectionCore<T>(
  candidateId: string,
  rawSection: unknown,
  sectionSchema: z.ZodType<T>,
  apply: (base: MasterCareerProfileData, section: T) => MasterCareerProfileData,
): Promise<UpsertMasterCareerProfileResult> {
  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const parsed = sectionSchema.safeParse(rawSection);
  if (!parsed.success) {
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

  // The core upsert revalidates the merged document and enforces
  // the size cap before persisting.
  return upsertMasterCareerProfileCore(candidateId, apply(base, parsed.data));
}

async function updateProfileSection<T>(
  candidateId: string,
  rawSection: unknown,
  sectionSchema: z.ZodType<T>,
  apply: (base: MasterCareerProfileData, section: T) => MasterCareerProfileData,
): Promise<UpsertMasterCareerProfileResult> {
  await requireInternalSession();
  return updateProfileSectionCore(
    candidateId,
    rawSection,
    sectionSchema,
    apply,
  );
}

export function updateMasterCareerProfileBasics(
  candidateId: string,
  rawBasics: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawBasics,
    masterCareerProfileBasicsSchema,
    (base, basics) => ({ ...base, basics }),
  );
}

export function updateMasterCareerProfileWork(
  candidateId: string,
  rawWork: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawWork,
    masterCareerProfileWorkSchema,
    (base, work) => ({ ...base, work }),
  );
}

export function updateMasterCareerProfileEducation(
  candidateId: string,
  rawEducation: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawEducation,
    masterCareerProfileEducationSchema,
    (base, education) => ({ ...base, education }),
  );
}

export function updateMasterCareerProfileSkills(
  candidateId: string,
  rawSkills: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawSkills,
    masterCareerProfileSkillsSchema,
    (base, skills) => ({ ...base, skills }),
  );
}

export function updateMasterCareerProfileProjects(
  candidateId: string,
  rawProjects: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawProjects,
    masterCareerProfileProjectsSchema,
    (base, projects) => ({ ...base, projects }),
  );
}

export function updateMasterCareerProfileCertifications(
  candidateId: string,
  rawCertifications: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawCertifications,
    masterCareerProfileCertificationsSchema,
    (base, certifications) => ({ ...base, certifications }),
  );
}

export function updateMasterCareerProfileLanguages(
  candidateId: string,
  rawLanguages: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  return updateProfileSection(
    candidateId,
    rawLanguages,
    masterCareerProfileLanguagesSchema,
    (base, languages) => ({ ...base, languages }),
  );
}

export async function upsertMasterCareerProfileCore(
  candidateId: string,
  rawProfile: unknown,
): Promise<UpsertMasterCareerProfileResult> {
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

export async function getMasterCareerProfile(
  candidateId: string,
): Promise<GetMasterCareerProfileResult> {
  await requireInternalSession();
  return getMasterCareerProfileCore(candidateId);
}

export async function upsertMasterCareerProfile(
  candidateId: string,
  rawProfile: unknown,
): Promise<UpsertMasterCareerProfileResult> {
  await requireInternalSession();
  return upsertMasterCareerProfileCore(candidateId, rawProfile);
}

/** Candidate-facing section writes: callers pass the session-owned id. */
export function updateCandidateProfileBasics(
  candidateId: string,
  rawBasics: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawBasics,
    masterCareerProfileBasicsSchema,
    (base, basics) => ({ ...base, basics }),
  );
}
export function updateCandidateProfileWork(
  candidateId: string,
  rawWork: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawWork,
    masterCareerProfileWorkSchema,
    (base, work) => ({ ...base, work }),
  );
}
export function updateCandidateProfileEducation(
  candidateId: string,
  rawEducation: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawEducation,
    masterCareerProfileEducationSchema,
    (base, education) => ({ ...base, education }),
  );
}
export function updateCandidateProfileSkills(
  candidateId: string,
  rawSkills: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawSkills,
    masterCareerProfileSkillsSchema,
    (base, skills) => ({ ...base, skills }),
  );
}
export function updateCandidateProfileProjects(
  candidateId: string,
  rawProjects: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawProjects,
    masterCareerProfileProjectsSchema,
    (base, projects) => ({ ...base, projects }),
  );
}
export function updateCandidateProfileCertifications(
  candidateId: string,
  rawCertifications: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawCertifications,
    masterCareerProfileCertificationsSchema,
    (base, certifications) => ({ ...base, certifications }),
  );
}
export function updateCandidateProfileLanguages(
  candidateId: string,
  rawLanguages: unknown,
) {
  return updateProfileSectionCore(
    candidateId,
    rawLanguages,
    masterCareerProfileLanguagesSchema,
    (base, languages) => ({ ...base, languages }),
  );
}
