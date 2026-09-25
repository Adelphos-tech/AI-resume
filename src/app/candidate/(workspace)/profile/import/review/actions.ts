"use server";

import { importResumeToCareerProfile } from "@/server/resume-import/import-to-profile";

export async function candidateImportResumeAction(payload: unknown) {
  return importResumeToCareerProfile(payload);
}
