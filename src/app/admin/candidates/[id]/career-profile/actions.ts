"use server";

import { revalidatePath } from "next/cache";

import { updateMasterCareerProfileBasics } from "@/server/career-profile/master-career-profile";

export async function updateBasicsAction(candidateId: string, basics: unknown) {
  const result = await updateMasterCareerProfileBasics(candidateId, basics);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
  }

  return result;
}
