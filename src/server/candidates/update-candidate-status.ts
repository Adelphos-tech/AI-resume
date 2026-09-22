import "server-only";

import { z } from "zod";

import { updateCandidateStatusSchema } from "@/lib/candidate-schemas";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

const candidateIdSchema = z.cuid();

export type UpdateCandidateStatusResult =
  { success: true; changed: boolean } | { success: false; message: string };

export async function updateCandidateStatus(
  id: string,
  rawInput: unknown,
): Promise<UpdateCandidateStatusResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const parsed = updateCandidateStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, message: "Select a valid status." };
  }

  try {
    const { count } = await prisma.candidate.updateMany({
      where: { id: parsedId.data, status: { not: parsed.data.status } },
      data: { status: parsed.data.status },
    });

    if (count === 1) {
      return { success: true, changed: true };
    }

    const exists = await prisma.candidate.findUnique({
      where: { id: parsedId.data },
      select: { id: true },
    });
    return exists
      ? { success: true, changed: false }
      : { success: false, message: "Candidate not found." };
  } catch {
    return { success: false, message: "Unable to update status." };
  }
}
