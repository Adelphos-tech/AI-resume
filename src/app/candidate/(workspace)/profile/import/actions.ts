"use server";

import { extractCandidateResumeCore } from "@/server/resume-extraction/extract-resume";
import { requireCandidateSession } from "@/server/session";

export async function candidateExtractResumeAction() {
  const { candidate } = await requireCandidateSession();
  return extractCandidateResumeCore(candidate.id);
}
