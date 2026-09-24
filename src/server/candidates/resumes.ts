import "server-only";

import {
  MASTER_CAREER_PROFILE_SCHEMA_VERSION,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import {
  createResumeVariantCore,
  listCandidateResumeVariantsCore,
} from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

/**
 * Read the owned candidate's resume variants plus the target-role
 * suggestions the create form may offer. candidateId is always
 * session-derived — the browser can never select another Candidate.
 */
export async function getCandidateResumes() {
  const { candidate } = await requireCandidateSession();

  const [list, intake, profile] = await Promise.all([
    listCandidateResumeVariantsCore(candidate.id),
    prisma.candidateIntake.findUnique({
      where: { candidateId: candidate.id },
      select: { targetRoles: true },
    }),
    prisma.masterCareerProfile.findUnique({
      where: { candidateId: candidate.id },
      select: { schemaVersion: true, profileData: true },
    }),
  ]);

  const resumeReady =
    profile !== null &&
    profile.schemaVersion === MASTER_CAREER_PROFILE_SCHEMA_VERSION &&
    resumeReadyMasterCareerProfileSchema.safeParse(profile.profileData).success;

  return {
    list,
    targetRoleSuggestions: intake?.targetRoles ?? [],
    resumeReady,
  };
}

/**
 * Candidate create boundary. The browser may supply only
 * name/targetRole/targetCountry/templateKey — validated strictly inside
 * the core; the snapshot and ResumeData are composed server-side from
 * the CURRENT canonical MCP.
 */
export async function createCandidateResume(rawConfig: unknown) {
  const { candidate } = await requireCandidateSession();
  return createResumeVariantCore(candidate.id, rawConfig);
}
