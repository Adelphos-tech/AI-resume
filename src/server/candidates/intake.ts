import "server-only";

import {
  candidateIntakeDraftSchema,
  candidateIntakeSubmitSchema,
} from "@/lib/candidate-intake-schema";
import { resolveCandidateIntakeToken } from "@/server/candidates/intake-access";
import { prisma } from "@/server/db";

const UNAVAILABLE_MESSAGE = "This intake link is no longer available.";

export type IntakeWriteResult =
  | { success: true; submittedAt: Date | null }
  | { success: false; message: string };

export type CandidateIntakeData = {
  currentRole: string | null;
  targetRoles: string[];
  preferredLocations: string[];
  workplacePreferences: string[];
  employmentPreferences: string[];
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  workAuthorization: string | null;
  requiresSponsorship: boolean | null;
  preferredIndustries: string[];
  careerGoals: string | null;
  additionalNotes: string | null;
  submittedAt: Date | null;
};

export async function getCandidateIntake(
  token: string,
): Promise<CandidateIntakeData | null> {
  const resolved = await resolveCandidateIntakeToken(token);
  if (!resolved) {
    return null;
  }

  const intake = await prisma.candidateIntake.findUnique({
    where: { candidateId: resolved.candidateId },
    select: {
      currentRole: true,
      targetRoles: true,
      preferredLocations: true,
      workplacePreferences: true,
      employmentPreferences: true,
      salaryExpectation: true,
      salaryCurrency: true,
      workAuthorization: true,
      requiresSponsorship: true,
      preferredIndustries: true,
      careerGoals: true,
      additionalNotes: true,
      submittedAt: true,
    },
  });

  return intake;
}

async function writeCandidateIntake(
  token: string,
  rawInput: unknown,
  submit: boolean,
): Promise<IntakeWriteResult> {
  const resolved = await resolveCandidateIntakeToken(token);
  if (!resolved) {
    return { success: false, message: UNAVAILABLE_MESSAGE };
  }

  const schema = submit
    ? candidateIntakeSubmitSchema
    : candidateIntakeDraftSchema;
  const parsed = schema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: submit
        ? "Some required answers are missing or invalid."
        : "Some answers are invalid. Please review and try again.",
    };
  }

  const data = parsed.data;
  const values = {
    currentRole: data.currentRole ?? null,
    targetRoles: data.targetRoles ?? [],
    preferredLocations: data.preferredLocations ?? [],
    workplacePreferences: data.workplacePreferences ?? [],
    employmentPreferences: data.employmentPreferences ?? [],
    salaryExpectation: data.salaryExpectation ?? null,
    salaryCurrency: data.salaryCurrency ?? null,
    workAuthorization: data.workAuthorization ?? null,
    requiresSponsorship: data.requiresSponsorship ?? null,
    preferredIndustries: data.preferredIndustries ?? [],
    careerGoals: data.careerGoals ?? null,
    additionalNotes: data.additionalNotes ?? null,
  };

  const existing = await prisma.candidateIntake.findUnique({
    where: { candidateId: resolved.candidateId },
    select: { id: true, submittedAt: true },
  });

  const submittedAt = submit
    ? (existing?.submittedAt ?? new Date())
    : (existing?.submittedAt ?? null);

  const intake = await prisma.candidateIntake.upsert({
    where: { candidateId: resolved.candidateId },
    create: {
      candidateId: resolved.candidateId,
      ...values,
      submittedAt,
    },
    update: {
      ...values,
      submittedAt,
    },
    select: { submittedAt: true },
  });

  return { success: true, submittedAt: intake.submittedAt };
}

export async function saveCandidateIntake(
  token: string,
  rawInput: unknown,
): Promise<IntakeWriteResult> {
  return writeCandidateIntake(token, rawInput, false);
}

export async function submitCandidateIntake(
  token: string,
  rawInput: unknown,
): Promise<IntakeWriteResult> {
  return writeCandidateIntake(token, rawInput, true);
}
