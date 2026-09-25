import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import {
  MASTER_CAREER_PROFILE_SCHEMA_VERSION,
  masterCareerProfileSchema,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import {
  createResumeVariantConfigSchema,
  resumeDataSchema,
  type ResumeData,
} from "@/lib/resume-schema";
import { prisma } from "@/server/db";
import { composeResumeFromMasterProfile } from "@/server/resume-variants/compose-resume";
import { requireInternalSession } from "@/server/session";

const candidateIdSchema = z.cuid();
const variantIdSchema = z.cuid();

export type ResumeVariantSummary = {
  id: string;
  candidateId: string;
  name: string;
  targetRole: string;
  targetCountry: string;
  templateKey: string;
  profileSchemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
  /** Persisted JSONB resume document — untrusted until parsed. */
  resumeData: Prisma.JsonValue;
};

export type CreateResumeVariantResult =
  | { success: true; variant: ResumeVariantSummary }
  | { success: false; message: string };

export type GetResumeVariantResult =
  | {
      success: true;
      variant: ResumeVariantSummary & {
        resumeData: ResumeData;
      };
    }
  | { success: false; message: string };

export type ListResumeVariantsResult =
  | { success: true; variants: ResumeVariantSummary[] }
  | { success: false; message: string };

/**
 * Create a Resume Variant: deterministic composition of the CURRENT
 * canonical Master Career Profile. The browser supplies only
 * name/targetRole/targetCountry/templateKey — the snapshot and
 * resumeData are generated server-side and can never be forged.
 */
/**
 * Authorization-free core: callers MUST enforce their own session/ownership
 * boundary. The admin wrapper enforces requireInternalSession(); the
 * candidate wrapper enforces requireCandidateSession() and passes the
 * session-owned candidate id.
 */
export async function createResumeVariantCore(
  candidateId: string,
  rawConfig: unknown,
): Promise<CreateResumeVariantResult> {
  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const config = createResumeVariantConfigSchema.safeParse(rawConfig);
  if (!config.success) {
    return { success: false, message: "Resume details are invalid." };
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: parsedId.data },
    select: {
      id: true,
      careerProfile: {
        select: { schemaVersion: true, profileData: true },
      },
    },
  });
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }
  if (!candidate.careerProfile) {
    return {
      success: false,
      message: "Create the career profile before generating a resume.",
    };
  }

  if (
    candidate.careerProfile.schemaVersion !==
    MASTER_CAREER_PROFILE_SCHEMA_VERSION
  ) {
    return { success: false, message: "Unsupported profile schema version." };
  }

  const profile = masterCareerProfileSchema.safeParse(
    candidate.careerProfile.profileData,
  );
  if (!profile.success) {
    return { success: false, message: "Stored profile data is invalid." };
  }

  const ready = resumeReadyMasterCareerProfileSchema.safeParse(profile.data);
  if (!ready.success) {
    return {
      success: false,
      message:
        "Profile needs a full name plus at least one work, education, or project entry.",
    };
  }

  // Deterministic composition — output always satisfies the canonical
  // ResumeData contract (composer parses it before returning).
  const resumeData = composeResumeFromMasterProfile(profile.data);

  const record = await prisma.resumeVariant.create({
    data: {
      candidateId: parsedId.data,
      name: config.data.name,
      targetRole: config.data.targetRole,
      targetCountry: config.data.targetCountry,
      templateKey: config.data.templateKey,
      profileSchemaVersion: MASTER_CAREER_PROFILE_SCHEMA_VERSION,
      profileSnapshot: profile.data as Prisma.InputJsonValue,
      resumeData: resumeData as unknown as Prisma.InputJsonValue,
    },
  });

  return { success: true, variant: toSummary(record) };
}

export async function getResumeVariantCore(
  variantId: string,
): Promise<GetResumeVariantResult> {
  const parsedId = variantIdSchema.safeParse(variantId);
  if (!parsedId.success) {
    return { success: false, message: "Resume variant not found." };
  }

  const row = await prisma.resumeVariant.findUnique({
    where: { id: parsedId.data },
  });
  if (!row) {
    return { success: false, message: "Resume variant not found." };
  }

  // JSONB is untrusted — revalidate both documents on every read.
  if (row.profileSchemaVersion !== MASTER_CAREER_PROFILE_SCHEMA_VERSION) {
    return { success: false, message: "Unsupported profile schema version." };
  }
  const snapshot = masterCareerProfileSchema.safeParse(row.profileSnapshot);
  if (!snapshot.success) {
    return { success: false, message: "Stored profile snapshot is invalid." };
  }
  const resumeData = resumeDataSchema.safeParse(row.resumeData);
  if (!resumeData.success) {
    return { success: false, message: "Stored resume data is invalid." };
  }

  return {
    success: true,
    variant: { ...toSummary(row), resumeData: resumeData.data },
  };
}

export async function listCandidateResumeVariantsCore(
  candidateId: string,
): Promise<ListResumeVariantsResult> {
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

  const rows = await prisma.resumeVariant.findMany({
    where: { candidateId: parsedId.data },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, variants: rows.map(toSummary) };
}

function toSummary(row: {
  id: string;
  candidateId: string;
  name: string;
  targetRole: string;
  targetCountry: string;
  templateKey: string;
  profileSchemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
  resumeData: Prisma.JsonValue;
}): ResumeVariantSummary {
  return {
    id: row.id,
    candidateId: row.candidateId,
    name: row.name,
    targetRole: row.targetRole,
    targetCountry: row.targetCountry,
    templateKey: row.templateKey,
    profileSchemaVersion: row.profileSchemaVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    resumeData: row.resumeData,
  };
}

export async function createResumeVariant(
  candidateId: string,
  rawConfig: unknown,
): Promise<CreateResumeVariantResult> {
  await requireInternalSession();
  return createResumeVariantCore(candidateId, rawConfig);
}

export async function listCandidateResumeVariants(
  candidateId: string,
): Promise<ListResumeVariantsResult> {
  await requireInternalSession();
  return listCandidateResumeVariantsCore(candidateId);
}

export async function getResumeVariant(
  variantId: string,
): Promise<GetResumeVariantResult> {
  await requireInternalSession();
  return getResumeVariantCore(variantId);
}
