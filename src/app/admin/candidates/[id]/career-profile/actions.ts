"use server";

import { revalidatePath } from "next/cache";

import {
  updateMasterCareerProfileBasics,
  updateMasterCareerProfileCertifications,
  updateMasterCareerProfileEducation,
  updateMasterCareerProfileLanguages,
  updateMasterCareerProfileProjects,
  updateMasterCareerProfileSkills,
  updateMasterCareerProfileWork,
} from "@/server/career-profile/master-career-profile";

function revalidateProfile(candidateId: string) {
  revalidatePath(`/admin/candidates/${candidateId}`);
  revalidatePath(`/admin/candidates/${candidateId}/career-profile`);
}

export async function updateBasicsAction(candidateId: string, basics: unknown) {
  const result = await updateMasterCareerProfileBasics(candidateId, basics);
  if (result.success) revalidateProfile(candidateId);
  return result;
}

export async function updateWorkAction(candidateId: string, work: unknown) {
  const result = await updateMasterCareerProfileWork(candidateId, work);
  if (result.success) revalidateProfile(candidateId);
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
  if (result.success) revalidateProfile(candidateId);
  return result;
}

export async function updateSkillsAction(candidateId: string, skills: unknown) {
  const result = await updateMasterCareerProfileSkills(candidateId, skills);
  if (result.success) revalidateProfile(candidateId);
  return result;
}

export async function updateProjectsAction(
  candidateId: string,
  projects: unknown,
) {
  const result = await updateMasterCareerProfileProjects(candidateId, projects);
  if (result.success) revalidateProfile(candidateId);
  return result;
}

export async function updateCertificationsAction(
  candidateId: string,
  certifications: unknown,
) {
  const result = await updateMasterCareerProfileCertifications(
    candidateId,
    certifications,
  );
  if (result.success) revalidateProfile(candidateId);
  return result;
}

export async function updateLanguagesAction(
  candidateId: string,
  languages: unknown,
) {
  const result = await updateMasterCareerProfileLanguages(
    candidateId,
    languages,
  );
  if (result.success) revalidateProfile(candidateId);
  return result;
}
