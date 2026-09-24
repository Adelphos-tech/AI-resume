"use server";

import { revalidatePath } from "next/cache";

import { createCandidateResume } from "@/server/candidates/resumes";

export async function createResumeAction(config: unknown) {
  const result = await createCandidateResume(config);
  if (result.success) {
    revalidatePath("/candidate/resumes");
    revalidatePath("/candidate");
  }
  return result;
}
