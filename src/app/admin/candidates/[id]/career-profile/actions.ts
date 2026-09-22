"use server";

import { revalidatePath } from "next/cache";

import {
  updateMasterCareerProfileBasics,
  updateMasterCareerProfileEducation,
  updateMasterCareerProfileSkills,
  updateMasterCareerProfileWork,
} from "@/server/career-profile/master-career-profile";

export async function updateBasicsAction(candidateId: string, basics: unknown) {
  const result = await updateMasterCareerProfileBasics(candidateId, basics);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
  }

  return result;
}

export async function updateWorkAction(candidateId: string, work: unknown) {
  const result = await updateMasterCareerProfileWork(candidateId, work);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
  }

  return result;
}

export async function updateEducationAction(
  candidateId: string,
  education: unknown,
) {
  const result = await updateMasterCareerProfileEducation(
    candidateId,
    education,
  );

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
  }

  return result;
}

export async function updateSkillsAction(candidateId: string, skills: unknown) {
  const result = await updateMasterCareerProfileSkills(candidateId, skills);

  if (result.success) {
    revalidatePath(`/admin/candidates/${candidateId}`);
    revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
  }

  return result;
}
