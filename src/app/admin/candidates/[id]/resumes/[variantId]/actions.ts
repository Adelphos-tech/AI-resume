"use server";

import { reviewResumeVariant } from "@/server/ai/resume-review";

export async function reviewResumeAction(
  candidateId: string,
  variantId: string,
) {
  return reviewResumeVariant(candidateId, variantId);
}
