import "server-only";

import { z } from "zod";
import { resolveWhatsapp, whatsappPublicUrl } from "./whatsapp";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";
import { nullableUrl } from "@/server/public-profile/url";
import type { PublicProfileResult } from "@/server/public-profile/public-profile";
import {
  deleteLogo,
  newLogoKey,
  normalizeLogo,
  writeLogo,
} from "@/server/company-logo/store";

/**
 * Company Profile — optional 0..1 company identity on a PublicProfile.
 * Not a separate account/tenant; managed by the owning candidate and
 * private until isVisible is explicitly set.
 */

// --- Validation -------------------------------------------------------------

const trimMax = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

const trimmedList = (max: number, each: number) =>
  z
    .array(z.string().trim().min(1).max(each))
    .max(max)
    .transform((arr) => arr.filter((v) => v.length > 0));

/**
 * WhatsApp accepts a national number (interpreted against the selected
 * country) or a full international +… number. Stored canonically as
 * E.164 by libphonenumber — trunk prefixes are handled correctly, never
 * by manual concatenation.
 */
const whatsappNumber = z.string().trim().max(40);
const whatsappCountry = z.string().trim().toUpperCase().max(2);

export const companyProfileSettingsSchema = z.strictObject({
  companyName: z.string().trim().min(1).max(120),
  tagline: trimMax(180),
  contactPersonName: trimMax(120),
  contactPersonRole: trimMax(120),
  publicPhone: trimMax(40),
  whatsappNumber: whatsappNumber,
  whatsappCountry: whatsappCountry,
  publicEmail: z
    .string()
    .trim()
    .max(320)
    .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))
    .transform((v) => (v === "" ? null : v)),
  websiteUrl: nullableUrl(2048),
  linkedinUrl: nullableUrl(2048),
  facebookUrl: nullableUrl(2048),
  instagramUrl: nullableUrl(2048),
  xUrl: nullableUrl(2048),
  youtubeUrl: nullableUrl(2048),
  tiktokUrl: nullableUrl(2048),
  about: trimMax(2000),
  industry: trimMax(120),
  locations: trimmedList(10, 160),
  services: trimmedList(20, 160),
  hiringOpen: z.boolean(),
  openRolesSummary: trimMax(500),
  openRolesUrl: nullableUrl(2048),
  companyProfileSummary: trimMax(500),
  companyProfileUrl: nullableUrl(2048),
  showPublicPhone: z.boolean(),
  showPublicEmail: z.boolean(),
  showWhatsapp: z.boolean(),
  showContactPerson: z.boolean(),
  isVisible: z.boolean(),
});

export type CompanyProfileSettingsInput = z.infer<
  typeof companyProfileSettingsSchema
>;

// --- Persistence ------------------------------------------------------------

/**
 * Create-on-first-save, update-after — PublicProfileId uniqueness enforces
 * one company per profile. Never deletes the row when fields are cleared.
 */
export async function updateCompanyProfileSettings(
  raw: unknown,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const parsed = companyProfileSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues.find((i) => i.path[0] === "whatsappNumber")
          ?.message ??
        "Check your company entries — links must be valid http(s) URLs and text fields have length limits.",
    };
  }
  const {
    whatsappCountry: waCountry,
    whatsappNumber: rawWhatsapp,
    ...data
  } = parsed.data;

  const wa = resolveWhatsapp(rawWhatsapp, waCountry);
  if (!wa.ok) {
    return { success: false, message: wa.message };
  }
  const whatsapp = wa.number || null;

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }

  // whatsappCountry is private settings metadata — persisted for
  // hydration fidelity (shared calling codes like +44/+1 make reverse
  // inference ambiguous); it never enters the public DTO.
  const companyData = {
    ...data,
    whatsappNumber: whatsapp,
    whatsappCountry: waCountry || null,
  };
  await prisma.companyProfile.upsert({
    where: { publicProfileId: profile.id },
    create: { publicProfileId: profile.id, ...companyData },
    update: companyData,
  });
  return { success: true };
}

// --- Logo -------------------------------------------------------------------

export type LogoActionResult =
  | { success: true; logoUrl: string | null }
  | { success: false; message: string };

/**
 * Logo pipeline — same safe ordering as profile/cover photos:
 * validate → normalize → write new → persist key → delete old.
 * Creates the CompanyProfile row implicitly (isVisible stays false) so a
 * candidate can upload before filling the form.
 */
export async function saveCompanyLogo(
  candidateId: string,
  bytes: Buffer,
): Promise<LogoActionResult> {
  const normalized = await normalizeLogo(bytes);
  if (!normalized.ok) return { success: false, message: normalized.message };

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: {
      id: true,
      slug: true,
      company: { select: { companyLogoKey: true } },
    },
  });
  if (!profile) {
    return { success: false, message: "Create your Career Card first." };
  }

  const newKey = newLogoKey();
  try {
    await writeLogo(newKey, normalized.buffer);
  } catch {
    return { success: false, message: "Upload failed. Try again." };
  }

  try {
    await prisma.companyProfile.upsert({
      where: { publicProfileId: profile.id },
      create: {
        publicProfileId: profile.id,
        companyName: "",
        companyLogoKey: newKey,
      },
      update: { companyLogoKey: newKey },
    });
  } catch {
    await deleteLogo(newKey);
    return { success: false, message: "Upload failed. Try again." };
  }

  const oldKey = profile.company?.companyLogoKey;
  if (oldKey) await deleteLogo(oldKey);
  return { success: true, logoUrl: `/u/${profile.slug}/company-logo` };
}

/** Clears the logo key first, then removes the stored file best-effort. */
export async function removeCompanyLogo(): Promise<LogoActionResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, company: { select: { companyLogoKey: true } } },
  });
  const key = profile?.company?.companyLogoKey;
  if (!profile || !key) {
    return { success: true, logoUrl: null };
  }
  await prisma.companyProfile.update({
    where: { publicProfileId: profile.id },
    data: { companyLogoKey: null },
  });
  await deleteLogo(key);
  return { success: true, logoUrl: null };
}

// --- Public DTO -------------------------------------------------------------

/** Optional company block for the public Career Profile DTO. */
export type CompanyProfileDTO = {
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  contactPersonName: string | null;
  contactPersonRole: string | null;
  publicPhone: string | null;
  publicEmail: string | null;
  /** https://wa.me/<digits> — only when the number is flagged public. */
  whatsappUrl: string | null;
  links: {
    website: string | null;
    linkedin: string | null;
    facebook: string | null;
    instagram: string | null;
    x: string | null;
    youtube: string | null;
    tiktok: string | null;
  };
  about: string | null;
  industry: string | null;
  locations: string[];
  services: string[];
  hiringOpen: boolean;
  openRolesSummary: string | null;
  openRolesUrl: string | null;
  companyProfileSummary: string | null;
  companyProfileUrl: string | null;
};

export type CompanyProfileRow = {
  isVisible: boolean;
  companyName: string;
  tagline: string | null;
  companyLogoKey: string | null;
  contactPersonName: string | null;
  contactPersonRole: string | null;
  publicPhone: string | null;
  publicEmail: string | null;
  whatsappNumber: string | null;
  whatsappCountry: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  xUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  about: string | null;
  industry: string | null;
  locations: string[];
  services: string[];
  hiringOpen: boolean;
  openRolesSummary: string | null;
  openRolesUrl: string | null;
  companyProfileSummary: string | null;
  companyProfileUrl: string | null;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showWhatsapp: boolean;
  showContactPerson: boolean;
};

/**
 * Public-safe projection — returns null when the company is hidden, and
 * contact fields only when their explicit visibility flags are set.
 * Never exposes keys, ids, or flags.
 */
export function buildCompanyProfileDTO(
  company: CompanyProfileRow | null,
  slug: string,
): CompanyProfileDTO | null {
  if (!company || !company.isVisible || !company.companyName) return null;
  return {
    companyName: company.companyName,
    tagline: company.tagline,
    logoUrl: company.companyLogoKey ? `/u/${slug}/company-logo` : null,
    contactPersonName: company.showContactPerson
      ? company.contactPersonName
      : null,
    contactPersonRole: company.showContactPerson
      ? company.contactPersonRole
      : null,
    publicPhone: company.showPublicPhone ? company.publicPhone : null,
    publicEmail: company.showPublicEmail ? company.publicEmail : null,
    whatsappUrl:
      company.showWhatsapp && company.whatsappNumber
        ? whatsappPublicUrl(company.whatsappNumber)
        : null,
    links: {
      website: company.websiteUrl,
      linkedin: company.linkedinUrl,
      facebook: company.facebookUrl,
      instagram: company.instagramUrl,
      x: company.xUrl,
      youtube: company.youtubeUrl,
      tiktok: company.tiktokUrl,
    },
    about: company.about,
    industry: company.industry,
    locations: company.locations,
    services: company.services,
    hiringOpen: company.hiringOpen,
    openRolesSummary: company.openRolesSummary,
    openRolesUrl: company.openRolesUrl,
    companyProfileSummary: company.companyProfileSummary,
    companyProfileUrl: company.companyProfileUrl,
  };
}
