"use server";

import { revalidatePath } from "next/cache";

import { updateCandidateProfileSection } from "@/server/candidates/career-profile";

export async function saveProfileSectionAction(
  section: unknown,
  payload: unknown,
) {
  const result = await updateCandidateProfileSection(section, payload);
  if (result.success) {
    revalidatePath("/candidate/profile");
    revalidatePath("/candidate");
  }
  return result;
}
