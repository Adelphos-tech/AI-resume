"use server";

import { z } from "zod";

import { reviewResumeVariantCore } from "@/server/ai/resume-review";
import { requireCandidateSession } from "@/server/session";

/**
 * Candidate AI-review boundary. The browser may supply only the
 * variantId — strictObject rejects anything else (candidateId,
 * targetRole, resumeData, model, prompt, …). Candidate identity is
 * session-derived; the persisted ResumeVariant is authoritative.
 */
const inputSchema = z.strictObject({ variantId: z.string().max(200) });

export async function candidateReviewResumeAction(input: unknown) {
  const { candidate } = await requireCandidateSession();

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Resume variant not found." };
  }

  return reviewResumeVariantCore(candidate.id, parsed.data.variantId);
}
