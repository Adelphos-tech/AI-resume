import "server-only";

import { createCandidateSchema } from "@/lib/candidate-schemas";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

export type CreateCandidateResult =
  { success: true; candidateId: string } | { success: false; message: string };

export async function createCandidate(
  rawInput: unknown,
): Promise<CreateCandidateResult> {
  await requireInternalSession();

  const parsed = createCandidateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
    };
  }

  try {
    const candidate = await prisma.candidate.create({
      data: parsed.data,
      select: { id: true },
    });
    return { success: true, candidateId: candidate.id };
  } catch {
    return {
      success: false,
      message: "Unable to create candidate. Please try again.",
    };
  }
}
