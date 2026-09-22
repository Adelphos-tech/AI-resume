import "server-only";

import { prisma } from "@/server/db";

export type ResumeSourceSummary = {
  originalFileName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: Date;
};

export async function getCandidateResumeSource(
  candidateId: string,
): Promise<ResumeSourceSummary | null> {
  return prisma.candidateResumeSource.findUnique({
    where: { candidateId },
    select: {
      originalFileName: true,
      sizeBytes: true,
      mimeType: true,
      uploadedAt: true,
    },
  });
}
