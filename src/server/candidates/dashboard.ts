import "server-only";

import {
  masterCareerProfileSchema,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { RESUME_TEMPLATES, type ResumeTemplateKey } from "@/lib/resume-schema";
import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

export type CareerProfileStatus =
  "not_started" | "in_progress" | "resume_ready" | "needs_attention";

export interface CandidateDashboardData {
  firstName: string;
  profileStatus: CareerProfileStatus;
  resumeCount: number;
  targetRoleCount: number;
  hasResumeSource: boolean;
  recentResumes: {
    id: string;
    name: string;
    targetRole: string;
    targetCountry: string;
    templateName: string;
    createdAt: Date;
  }[];
}

export async function getCandidateDashboardData(): Promise<CandidateDashboardData> {
  const { candidate } = await requireCandidateSession();

  const [profile, intake, resumeSource, resumeCount, recentResumes] =
    await Promise.all([
      prisma.masterCareerProfile.findUnique({
        where: { candidateId: candidate.id },
        select: { profileData: true },
      }),
      prisma.candidateIntake.findUnique({
        where: { candidateId: candidate.id },
        select: { targetRoles: true },
      }),
      prisma.candidateResumeSource.findUnique({
        where: { candidateId: candidate.id },
        select: { id: true },
      }),
      prisma.resumeVariant.count({ where: { candidateId: candidate.id } }),
      prisma.resumeVariant.findMany({
        where: { candidateId: candidate.id },
        select: {
          id: true,
          name: true,
          targetRole: true,
          targetCountry: true,
          templateKey: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  let profileStatus: CareerProfileStatus = "not_started";
  if (profile) {
    if (!masterCareerProfileSchema.safeParse(profile.profileData).success) {
      profileStatus = "needs_attention";
    } else {
      profileStatus = resumeReadyMasterCareerProfileSchema.safeParse(
        profile.profileData,
      ).success
        ? "resume_ready"
        : "in_progress";
    }
  }

  return {
    firstName: candidate.firstName,
    profileStatus,
    resumeCount,
    targetRoleCount: intake?.targetRoles.length ?? 0,
    hasResumeSource: resumeSource !== null,
    recentResumes: recentResumes.map((r) => ({
      id: r.id,
      name: r.name,
      targetRole: r.targetRole,
      targetCountry: r.targetCountry,
      templateName:
        RESUME_TEMPLATES[r.templateKey as ResumeTemplateKey]?.name ??
        r.templateKey,
      createdAt: r.createdAt,
    })),
  };
}
