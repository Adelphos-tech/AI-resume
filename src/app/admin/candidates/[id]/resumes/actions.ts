"use server";

import { revalidatePath } from "next/cache";

import { createResumeVariant } from "@/server/resume-variants/resume-variants";

export async function createResumeVariantAction(
  candidateId: string,
  config: unknown,
) {
  const result = await createResumeVariant(candidateId, config);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}/resumes`);
    revalidatePath(`/admin/candidates/${candidateId}`);
  }

  return result;
}
