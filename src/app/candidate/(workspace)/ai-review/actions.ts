"use server";

import { z } from "zod";

import { reviewResumeVariantCore } from "@/server/ai/resume-review";
import { JOB_DESCRIPTION_MAX } from "@/server/ai/resume-review-schema";
import { requireCandidateSession } from "@/server/session";

/**
 * Candidate AI-review boundary. The browser may supply only the
 * variantId and an optional jobDescription — strictObject rejects
 * anything else (candidateId, targetRole, resumeData, model, prompt, …).
 * Candidate identity is session-derived; the persisted ResumeVariant is
 * authoritative. The job description is untrusted free text: trimmed,
 * length-capped, and passed to the provider as data, never instructions.
 */
const inputSchema = z.strictObject({
  variantId: z.string().max(200),
  jobDescription: z.string().trim().max(JOB_DESCRIPTION_MAX).optional(),
});

export async function candidateReviewResumeAction(input: unknown) {
  const { candidate } = await requireCandidateSession();

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Resume variant not found." };
  }

  return reviewResumeVariantCore(
    candidate.id,
    parsed.data.variantId,
    parsed.data.jobDescription || undefined,
  );
}
