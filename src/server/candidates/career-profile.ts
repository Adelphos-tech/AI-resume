import "server-only";

import { z } from "zod";

import {
  getMasterCareerProfileCore,
  updateCandidateProfileBasics,
  updateCandidateProfileCertifications,
  updateCandidateProfileEducation,
  updateCandidateProfileLanguages,
  updateCandidateProfileProjects,
  updateCandidateProfileSkills,
  updateCandidateProfileWork,
} from "@/server/career-profile/master-career-profile";
import { requireCandidateSession } from "@/server/session";

const sectionSchema = z.enum([
  "basics",
  "work",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
]);

export type CandidateProfileSection = z.infer<typeof sectionSchema>;

const SECTION_WRITERS = {
  basics: updateCandidateProfileBasics,
  work: updateCandidateProfileWork,
  education: updateCandidateProfileEducation,
  skills: updateCandidateProfileSkills,
  projects: updateCandidateProfileProjects,
  certifications: updateCandidateProfileCertifications,
  languages: updateCandidateProfileLanguages,
} as const;

/**
 * Read the owned candidate's career profile. candidateId is always
 * session-derived — the browser can never select another Candidate.
 */
export async function getCandidateProfile() {
  const { candidate } = await requireCandidateSession();
  const result = await getMasterCareerProfileCore(candidate.id);
  return { candidate, result };
}

/**
 * Candidate section-write boundary. Only a strict section payload is
 * accepted; candidateId/schemaVersion/internal fields cannot be
 * submitted. The core merges the section into the CURRENT canonical
 * profile and revalidates the full document before persisting.
 */
export async function updateCandidateProfileSection(
  section: unknown,
  rawSection: unknown,
) {
  const { candidate } = await requireCandidateSession();

  const parsedSection = sectionSchema.safeParse(section);
  if (!parsedSection.success) {
    return { success: false as const, message: "Unknown profile section." };
  }

  return SECTION_WRITERS[parsedSection.data](candidate.id, rawSection);
}
