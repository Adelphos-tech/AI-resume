import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

/** Top-level paths that must never be claimable as a public slug. */
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "candidate",
  "intake",
  "login",
  "logout",
  "print",
  "register",
  "u",
  "n",
  "health",
  "settings",
  "help",
  "_next",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;

export const publicProfileSchema = {
  slug: {
    min: 2,
    max: 48,
  },
};

export type PublicProfileResult =
  { success: true } | { success: false; message: string };

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** 192-bit opaque share token — no relation to candidate/profile ids. */
function generateLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function getCandidatePublicProfile() {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    include: { links: true },
  });
  return { candidate, profile };
}

/**
 * Atomically creates the candidate's PublicProfile + one permanent
 * PublicProfileLink. `candidateId` and `publicProfileId` uniqueness are
 * the final authority — a concurrent create returns the existing rows.
 */
export async function createPublicProfile(): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();

  const existing = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (existing) return { success: true };

  const base =
    slugify(`${candidate.firstName} ${candidate.lastName}`) || "profile";
  const preferred = RESERVED_SLUGS.has(base) ? `${base}-x` : base;

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? preferred : `${preferred}-${attempt + 1}`;
    try {
      await prisma.$transaction(async (tx) => {
        const profile = await tx.publicProfile.create({
          data: { candidateId: candidate.id, slug },
        });
        await tx.publicProfileLink.create({
          data: {
            publicProfileId: profile.id,
            token: generateLinkToken(),
          },
        });
      });
      return { success: true };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        // Slug/token collision — retry; candidateId collision means a
        // concurrent create already succeeded.
        const after = await prisma.publicProfile.findUnique({
          where: { candidateId: candidate.id },
        });
        if (after) return { success: true };
        continue;
      }
      throw e;
    }
  }
  return {
    success: false,
    message: "We couldn't create your public profile. Please try again.",
  };
}

export async function updatePublicProfileSlug(
  rawSlug: unknown,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const parsed =
    typeof rawSlug === "string" ? rawSlug.trim().toLowerCase() : "";

  if (!isValidSlug(parsed)) {
    return {
      success: false,
      message:
        "Use 2–48 lowercase letters, numbers, or hyphens — no spaces, no leading/trailing hyphen, and not a reserved word.",
    };
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }

  try {
    await prisma.publicProfile.update({
      where: { id: profile.id },
      data: { slug: parsed },
    });
    return { success: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "That address is already taken. Try a different one.",
      };
    }
    throw e;
  }
}

export async function setPublicProfilePublished(
  isPublished: boolean,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }
  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: { isPublished },
  });
  return { success: true };
}

// --- Stage 7A2: content settings + public DTO --------------------------------

import { z } from "zod";

import {
  isCareerCardAccentColorId,
  resolveCareerCardAccent,
  type CareerCardAccentColorId,
} from "@/lib/career-card-accent-colors";
import {
  isCareerCardStyleId,
  resolveCareerCardStyle,
  type CareerCardStyleId,
} from "@/lib/career-card-styles";
import {
  isCareerCardThemeId,
  resolveCareerCardTheme,
  type CareerCardThemeId,
} from "@/lib/career-card-themes";
import { masterCareerProfileSchema } from "@/lib/master-career-profile-schema";
import { RESUME_TEMPLATES, type ResumeData } from "@/lib/resume-schema";

const publicHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  });

const INVALID_URL = "\0invalid-url";
const nullableUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => {
      if (v === "") return null;
      try {
        // Explicit scheme present — only http(s) may pass.
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:"
          ? u.href
          : INVALID_URL;
      } catch {
        // Scheme-less input — normalize to https and validate.
        try {
          return new URL(`https://${v}`).href;
        } catch {
          return INVALID_URL;
        }
      }
    })
    .pipe(publicHttpUrl.nullable());

export const publicProfileSettingsSchema = z.strictObject({
  publicHeadline: z
    .string()
    .trim()
    .max(300)
    .transform((v) => (v === "" ? null : v)),
  publicBio: z
    .string()
    .trim()
    .max(1500)
    .transform((v) => (v === "" ? null : v)),
  publicLocation: z
    .string()
    .trim()
    .max(200)
    .transform((v) => (v === "" ? null : v)),
  currentFocus: z
    .string()
    .trim()
    .max(200)
    .transform((v) => (v === "" ? null : v)),
  workAuthorization: z
    .string()
    .trim()
    .max(200)
    .transform((v) => (v === "" ? null : v)),
  openToOpportunities: z.boolean(),
  linkedinUrl: nullableUrl(2048),
  githubUrl: nullableUrl(2048),
  websiteUrl: nullableUrl(2048),
  showExperience: z.boolean(),
  showEducation: z.boolean(),
  showSkills: z.boolean(),
  showProjects: z.boolean(),
  showCertifications: z.boolean(),
  showLanguages: z.boolean(),
  featuredResumeVariantId: z.string().nullable(),
  themeId: z
    .string()
    .trim()
    .refine(isCareerCardThemeId)
    .transform((v) => v as CareerCardThemeId),
  accentColorId: z
    .string()
    .trim()
    .refine(isCareerCardAccentColorId)
    .transform((v) => v as CareerCardAccentColorId),
  cardStyleId: z
    .string()
    .trim()
    .refine(isCareerCardStyleId)
    .transform((v) => v as CareerCardStyleId),
});

export type PublicProfileSettingsInput = z.infer<
  typeof publicProfileSettingsSchema
>;

/**
 * Saves presentation config only — never mutates the canonical MCP and
 * never changes publish state.
 */
export async function updatePublicProfileSettings(
  raw: unknown,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const parsed = publicProfileSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message:
        "Check your entries — links must be valid http(s) URLs and text fields have length limits.",
    };
  }
  const data = parsed.data;

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }

  // Featured resume must be owned by this candidate.
  if (data.featuredResumeVariantId !== null) {
    const variant = await prisma.resumeVariant.findUnique({
      where: { id: data.featuredResumeVariantId },
      select: { candidateId: true },
    });
    if (!variant || variant.candidateId !== candidate.id) {
      return {
        success: false,
        message: "That resume is not available for your public profile.",
      };
    }
  }

  await prisma.publicProfile.update({
    where: { id: profile.id },
    data,
  });
  return { success: true };
}

export type PublicCareerProfileDTO = {
  themeId: CareerCardThemeId;
  accentColorId: CareerCardAccentColorId;
  cardStyleId: CareerCardStyleId;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  coverPhotoPosition: {
    focalX: number;
    focalY: number;
    zoom: number;
  };
  profilePhotoPosition: {
    focalX: number;
    focalY: number;
    zoom: number;
  };
  name: string;
  headline: string | null;
  bio: string | null;
  initials: string;
  location: string | null;
  currentFocus: string | null;
  workAuthorization: string | null;
  openToOpportunities: boolean;
  links: {
    linkedin: string | null;
    github: string | null;
    website: string | null;
  };
  featuredResume: {
    name: string;
    targetRole: string;
    targetCountry: string;
    templateName: string;
    templateKey: string;
    resumeData: ResumeData;
  } | null;
  experience: {
    position: string;
    company: string;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    summary: string | null;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    highlights: string[];
  }[];
  skills: { name: string; keywords: string[] }[];
  projects: {
    name: string;
    description: string | null;
    highlights: string[];
    url: string | null;
    startDate: string | null;
    endDate: string | null;
  }[];
  certifications: {
    name: string;
    issuer: string | null;
    date: string | null;
    url: string | null;
  }[];
  languages: { language: string; fluency: string | null }[];
};

function formatCareerDate(d: string | null): string | null {
  if (!d) return null;
  const [y, m] = d.split("-");
  if (!m) return y;
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Builds the exact public-safe DTO from a published PublicProfile row +
 * its candidate's canonical MCP. Never exposes ids, email, phone, or
 * extraction metadata. Returns null when the profile should not render.
 */
export function buildPublicProfileDTO(
  profile: {
    isPublished: boolean;
    slug: string;
    themeId: string;
    accentColorId: string;
    cardStyleId: string;
    profilePhotoKey: string | null;
    coverPhotoKey: string | null;
    coverPhotoFocalX: number;
    coverPhotoFocalY: number;
    coverPhotoZoom: number;
    profilePhotoFocalX: number;
    profilePhotoFocalY: number;
    profilePhotoZoom: number;
    publicHeadline: string | null;
    publicBio: string | null;
    publicLocation: string | null;
    currentFocus: string | null;
    workAuthorization: string | null;
    openToOpportunities: boolean;
    linkedinUrl: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
    showExperience: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showProjects: boolean;
    showCertifications: boolean;
    showLanguages: boolean;
    featuredResumeVariant: {
      name: string;
      targetRole: string;
      targetCountry: string;
      templateKey: string;
      resumeData: unknown;
    } | null;
    candidate: {
      firstName: string;
      lastName: string;
      careerProfile: { profileData: unknown } | null;
    };
  },
  /**
   * Owner preview: when true, an unpublished profile still produces a DTO.
   * Only callers that have verified the viewer owns the profile may use it.
   */
  options?: { allowUnpublished?: boolean },
): PublicCareerProfileDTO | null {
  if (!profile.isPublished && !options?.allowUnpublished) return null;

  const parsed = masterCareerProfileSchema.safeParse(
    profile.candidate.careerProfile?.profileData ?? {},
  );
  const mcp = parsed.success ? parsed.data : null;
  const basics = mcp?.basics;

  const name =
    basics?.fullName ||
    `${profile.candidate.firstName} ${profile.candidate.lastName}`.trim();
  return {
    themeId: resolveCareerCardTheme(profile.themeId),
    accentColorId: resolveCareerCardAccent(profile.accentColorId),
    cardStyleId: resolveCareerCardStyle(profile.cardStyleId),
    profilePhotoUrl: profile.profilePhotoKey
      ? `/u/${profile.slug}/photo`
      : null,
    coverPhotoUrl: profile.coverPhotoKey ? `/u/${profile.slug}/cover` : null,
    coverPhotoPosition: {
      focalX: profile.coverPhotoFocalX,
      focalY: profile.coverPhotoFocalY,
      zoom: profile.coverPhotoZoom,
    },
    profilePhotoPosition: {
      focalX: profile.profilePhotoFocalX,
      focalY: profile.profilePhotoFocalY,
      zoom: profile.profilePhotoZoom,
    },
    name,
    initials: name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase(),
    headline: profile.publicHeadline || basics?.headline || null,
    bio: profile.publicBio || null,
    location: profile.publicLocation || null,
    currentFocus: profile.currentFocus || null,
    workAuthorization: profile.workAuthorization || null,
    openToOpportunities: profile.openToOpportunities,
    links: {
      linkedin: profile.linkedinUrl,
      github: profile.githubUrl,
      website: profile.websiteUrl,
    },
    featuredResume: profile.featuredResumeVariant
      ? {
          name: profile.featuredResumeVariant.name,
          targetRole: profile.featuredResumeVariant.targetRole,
          targetCountry: profile.featuredResumeVariant.targetCountry,
          templateName:
            RESUME_TEMPLATES[
              profile.featuredResumeVariant
                .templateKey as keyof typeof RESUME_TEMPLATES
            ]?.name ?? profile.featuredResumeVariant.templateKey,
          templateKey: profile.featuredResumeVariant.templateKey,
          resumeData: profile.featuredResumeVariant.resumeData as ResumeData,
        }
      : null,
    experience:
      profile.showExperience && mcp
        ? mcp.work.map((w) => ({
            position: w.position,
            company: w.company,
            location: w.location,
            startDate: w.startDate,
            endDate: w.endDate,
            isCurrent: w.isCurrent,
            summary: w.summary,
            highlights: w.highlights,
          }))
        : [],
    education:
      profile.showEducation && mcp
        ? mcp.education.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            highlights: e.highlights,
          }))
        : [],
    skills:
      profile.showSkills && mcp
        ? mcp.skills.map((s) => ({ name: s.name, keywords: s.keywords }))
        : [],
    projects:
      profile.showProjects && mcp
        ? mcp.projects.map((pr) => ({
            name: pr.name,
            description: pr.description,
            highlights: pr.highlights,
            url: pr.url,
            startDate: pr.startDate,
            endDate: pr.endDate,
          }))
        : [],
    certifications:
      profile.showCertifications && mcp
        ? mcp.certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            date: c.date,
            url: c.url,
          }))
        : [],
    languages:
      profile.showLanguages && mcp
        ? mcp.languages.map((l) => ({
            language: l.language,
            fluency: l.fluency,
          }))
        : [],
  };
}

export { formatCareerDate };
