"use server";

import { revalidatePath } from "next/cache";

import type { UpdateCandidateStatusInput } from "@/lib/candidate-schemas";
import { updateCandidateStatus } from "@/server/candidates/update-candidate-status";

export async function updateCandidateStatusAction(
  candidateId: string,
  input: UpdateCandidateStatusInput,
) {
  const result = await updateCandidateStatus(candidateId, input);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath("/admin/candidates");
  }

  return result;
}
