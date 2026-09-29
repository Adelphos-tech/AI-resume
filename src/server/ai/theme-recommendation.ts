import "server-only";

import { z } from "zod";

import {
  CAREER_CARD_THEMES,
  isCareerCardThemeId,
  type CareerCardThemeId,
  type ThemeRecommendation,
} from "@/lib/career-card-themes";
import {
  masterCareerProfileSchema,
  type MasterCareerProfileData,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import {
  getGroqClient,
  getGroqModel,
  toAiServiceError,
} from "@/server/ai/groq-client";

export type ThemeRecommendationResult =
  | { success: true; recommendation: ThemeRecommendation }
  | { success: false; code: "THIN_PROFILE" | "AI_FAILED"; message: string };

// --- Deterministic career-signal derivation ----------------------------------
// Facts RoleRace already knows are computed in code — the model interprets
// signals, it does not recalculate them.

function yearsOfExperience(
  work: MasterCareerProfileData["work"],
): number | null {
  const now = new Date();
  let months = 0;
  let counted = false;
  for (const job of work) {
    if (!job.startDate) continue;
    const start = new Date(
      job.startDate.length === 4
        ? `${job.startDate}-01-01`
        : `${job.startDate}-01`,
    );
    if (Number.isNaN(start.getTime())) continue;
    const end =
      job.isCurrent || !job.endDate
        ? now
        : new Date(
            job.endDate.length === 4
              ? `${job.endDate}-01-01`
              : `${job.endDate}-01`,
          );
    if (Number.isNaN(end.getTime()) || end < start) continue;
    counted = true;
    months +=
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
  }
  return counted ? Math.round((months / 12) * 10) / 10 : null;
}

type CareerSignals = {
  currentRole: string | null;
  targetRoles: string[];
  headline: string | null;
  currentFocus: string | null;
  yearsExperience: number | null;
  experienceCount: number;
  projectCount: number;
  skillGroupCount: number;
  educationPresent: boolean;
  certificationsPresent: boolean;
  languagesPresent: boolean;
  hasGithub: boolean;
  hasLinkedin: boolean;
  hasWebsite: boolean;
  openToOpportunities: boolean;
  featuredResumePresent: boolean;
};

type ProfileWithSignals = {
  currentFocus: string | null;
  openToOpportunities: boolean;
  featuredResumeVariantId: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  candidate: {
    careerProfile: { profileData: unknown } | null;
    intake: {
      currentRole: string | null;
      targetRoles: string[];
    } | null;
  };
};

function deriveSignals(profile: ProfileWithSignals): {
  signals: CareerSignals | null;
  missing: string[];
} {
  const parsed = masterCareerProfileSchema
    .partial()
    .safeParse(profile.candidate.careerProfile?.profileData ?? {});
  const mcp: Partial<MasterCareerProfileData> = parsed.success
    ? parsed.data
    : {};

  const work = mcp.work ?? [];
  const skills = mcp.skills ?? [];
  const projects = mcp.projects ?? [];

  const missing: string[] = [];
  if (!profile.candidate.intake?.currentRole && work.length === 0)
    missing.push("current or target role");
  if (work.length === 0) missing.push("experience");
  if (skills.length === 0) missing.push("skills");
  if (projects.length === 0) missing.push("projects");

  // Not enough signal to make a meaningful recommendation — don't call AI.
  const signalCount =
    (profile.candidate.intake?.currentRole ? 1 : 0) +
    (profile.candidate.intake?.targetRoles.length ? 1 : 0) +
    work.length +
    skills.length +
    projects.length;
  if (signalCount === 0) {
    return { signals: null, missing };
  }

  return {
    missing: missing.length <= 2 ? missing : [],
    signals: {
      currentRole: profile.candidate.intake?.currentRole ?? null,
      targetRoles: profile.candidate.intake?.targetRoles ?? [],
      headline: mcp.basics?.headline ?? null,
      currentFocus: profile.currentFocus,
      yearsExperience: yearsOfExperience(work),
      experienceCount: work.length,
      projectCount: projects.length,
      skillGroupCount: skills.length,
      educationPresent: (mcp.education ?? []).length > 0,
      certificationsPresent: (mcp.certifications ?? []).length > 0,
      languagesPresent: (mcp.languages ?? []).length > 0,
      hasGithub: profile.githubUrl !== null,
      hasLinkedin: profile.linkedinUrl !== null,
      hasWebsite: profile.websiteUrl !== null,
      openToOpportunities: profile.openToOpportunities,
      featuredResumePresent: profile.featuredResumeVariantId !== null,
    },
  };
}

// --- Model output contract ----------------------------------------------------

const THEME_IDS = [
  "role-race-classic",
  "corporate-clean",
  "executive-dark",
  "tech-minimal",
] as const;

const recommendationSchema = z
  .strictObject({
    recommendedThemeId: z.enum(THEME_IDS),
    reasons: z.array(z.string().min(5).max(300)).min(2).max(3),
    alternatives: z
      .array(
        z.strictObject({
          themeId: z.enum(THEME_IDS),
          reason: z.string().min(5).max(300),
        }),
      )
      .max(2),
  })
  .superRefine((v, ctx) => {
    // Alternatives must not duplicate the primary pick.
    if (v.alternatives.some((a) => a.themeId === v.recommendedThemeId)) {
      ctx.addIssue({ code: "custom", message: "duplicate alternative" });
    }
    const seen = new Set<string>();
    if (
      v.alternatives.some((a) =>
        seen.has(a.themeId) ? true : (seen.add(a.themeId), false),
      )
    ) {
      ctx.addIssue({ code: "custom", message: "repeated alternative" });
    }
  });

const JSON_SCHEMA = {
  type: "object",
  properties: {
    recommendedThemeId: { type: "string", enum: THEME_IDS },
    reasons: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    alternatives: {
      type: "array",
      maxItems: 2,
      items: {
        type: "object",
        properties: {
          themeId: { type: "string", enum: THEME_IDS },
          reason: { type: "string" },
        },
        required: ["themeId", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendedThemeId", "reasons", "alternatives"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You recommend a Career Card theme for a RoleRace candidate.

You are given:
1. careerSignals — a compact structured summary of the candidate's career
   profile (counts, roles, presence flags). It contains NO photo, contact,
   or identity data.
2. themeCatalog — the only four themes that exist. You MUST recommend only
   these ids; never invent new ones.

Choose ONE primary theme and up to TWO alternatives (different ids, never
the primary). Reasons must reference career presentation needs —
experience, achievements, projects, skills, seniority, links — never
personality, appearance, or demographics. Qualitative only: no scores or
percentages.`;

/**
 * Explicit candidate-triggered AI theme recommendation. Reads the
 * candidate-owned structured profile server-side, derives deterministic
 * signals, asks the model to pick among the curated themes, and returns a
 * validated DTO. Nothing is persisted.
 */
export async function recommendTheme(
  candidateId: string,
): Promise<ThemeRecommendationResult> {
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: {
      currentFocus: true,
      openToOpportunities: true,
      featuredResumeVariantId: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      candidate: {
        select: {
          careerProfile: { select: { profileData: true } },
          intake: { select: { currentRole: true, targetRoles: true } },
        },
      },
    },
  });
  if (!profile) {
    return {
      success: false,
      code: "THIN_PROFILE",
      message: "Create your Career Card first.",
    };
  }

  const { signals, missing } = deriveSignals(profile);
  if (!signals) {
    return {
      success: false,
      code: "THIN_PROFILE",
      message: `Add more career information to get a personalized theme recommendation — try adding your ${missing.join(", ")}.`,
    };
  }

  const payload = {
    careerSignals: signals,
    themeCatalog: CAREER_CARD_THEMES.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      fits: t.fits,
    })),
  };

  let content: string | null;
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: getGroqModel(),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "theme_recommendation",
          strict: true,
          schema: JSON_SCHEMA,
        },
      },
      max_completion_tokens: 1024,
      temperature: 0.2,
    });
    content = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const e = toAiServiceError(err);
    console.error(`[theme-reco] ${e.code}`);
    return {
      success: false,
      code: "AI_FAILED",
      message: "Unable to get a recommendation right now. Please try again.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content ?? "");
  } catch {
    return {
      success: false,
      code: "AI_FAILED",
      message: "Unable to get a recommendation right now. Please try again.",
    };
  }

  const result = recommendationSchema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      code: "AI_FAILED",
      message: "Unable to get a recommendation right now. Please try again.",
    };
  }

  // Belt-and-braces: every id must exist in the registry before reaching UI.
  const labelOf = (id: string) =>
    CAREER_CARD_THEMES.find((t) => t.id === id)?.label ?? id;
  const valid = (id: string): id is CareerCardThemeId =>
    isCareerCardThemeId(id);

  const d = result.data;
  if (!valid(d.recommendedThemeId)) {
    return {
      success: false,
      code: "AI_FAILED",
      message: "Unable to get a recommendation right now. Please try again.",
    };
  }

  return {
    success: true,
    recommendation: {
      recommendedThemeId: d.recommendedThemeId,
      label: labelOf(d.recommendedThemeId),
      reasons: d.reasons,
      alternatives: d.alternatives
        .filter((a) => valid(a.themeId))
        .map((a) => ({
          themeId: a.themeId as CareerCardThemeId,
          label: labelOf(a.themeId),
          reason: a.reason,
        })),
    },
  };
}
