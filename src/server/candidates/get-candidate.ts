import "server-only";

import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

const candidateIdSchema = z.cuid();

const candidateDetailSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  location: true,
  linkedinUrl: true,
  package: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  intakeAccess: {
    select: {
      expiresAt: true,
      revokedAt: true,
    },
  },
  intake: {
    select: {
      submittedAt: true,
      updatedAt: true,
    },
  },
  careerProfile: {
    select: {
      schemaVersion: true,
      updatedAt: true,
    },
  },
  resumeSource: {
    select: {
      originalFileName: true,
      sizeBytes: true,
      mimeType: true,
      uploadedAt: true,
      extraction: {
        select: {
          status: true,
          pageCount: true,
          characterCount: true,
        },
      },
    },
  },
} satisfies Prisma.CandidateSelect;

export type CandidateDetail = Prisma.CandidateGetPayload<{
  select: typeof candidateDetailSelect;
}>;

export async function getCandidate(
  id: string,
): Promise<CandidateDetail | null> {
  await requireInternalSession();

  const parsed = candidateIdSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  return prisma.candidate.findUnique({
    where: { id: parsed.data },
    select: candidateDetailSelect,
  });
}
