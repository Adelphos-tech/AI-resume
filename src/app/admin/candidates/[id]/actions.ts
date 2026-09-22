"use server";

import { revalidatePath } from "next/cache";

import type { UpdateCandidateStatusInput } from "@/lib/candidate-schemas";
import {
  generateCandidateIntakeAccess,
  revokeCandidateIntakeAccess,
} from "@/server/candidates/intake-access";
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

export async function generateIntakeLinkAction(candidateId: string) {
  const result = await generateCandidateIntakeAccess(candidateId);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
  }

  return result;
}

export async function revokeIntakeLinkAction(candidateId: string) {
  const result = await revokeCandidateIntakeAccess(candidateId);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
  }

  return result;
}
