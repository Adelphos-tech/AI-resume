"use client";

import { useState } from "react";

import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { NfcCompactCard } from "@/components/career-card/compositions/nfc-compact/nfc-compact-card";
import { CrimsonNightCard } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-card";
import { nfcCompactAccentStyle } from "@/components/career-card/compositions/nfc-compact/nfc-compact-accents";
import { completedYearsOfExperience } from "@/components/career-card/adapters/public-profile-to-career-card";
import type { CompanyProfileDTO } from "@/server/public-profile/company-profile";
import type { PublicCareerProfileDTO } from "@/server/public-profile/public-profile";

/**
 * Stage 7A5H2B — NFC Compact / Dual Profile production card.
 *
 * Presentation models are derived from the public-safe DTO only — never
 * Prisma rows and never private visibility flags. The Candidate/Company
 * switch renders only when dto.company exists (isVisible + published
 * parent already enforced server-side). Switch state is local React
 * state; it is not persisted and never touches the URL or NFC token.
 */
export function NfcCompactLibraryCard({
  dto,
  slug,
}: {
  dto: PublicCareerProfileDTO;
  slug: string;
}) {
  const [active, setActive] = useState<"candidate" | "company">("candidate");
  const candidate = toCompactCandidate(dto, slug);
  const company = dto.company ? toCompactCompany(dto.company, dto) : null;
  const cta =
    active === "company" && company
      ? companyCta(company)
      : candidateCta(candidate);
  // Crimson Night skin — same data, same /n/<token> identity, dark premium
  // surface system. Accent stays independent (Passport honors it; Crimson
  // keeps its approved crimson identity).
  if (dto.nfcCompactSkinId === "crimson-night") {
    return (
      <main className="min-h-dvh bg-stone-950 px-3 py-6 sm:py-10">
        <CrimsonNightCard
          candidate={candidate}
          company={company}
          active={active}
          onSwitch={setActive}
          cta={cta}
          shareUrl={dto.shareUrl}
        />
      </main>
    );
  }
  return (
    <main className="min-h-dvh bg-stone-100 px-3 py-6 sm:py-10">
      <NfcCompactCard
        candidate={candidate}
        company={company}
        active={active}
        onSwitch={setActive}
        cta={cta}
        accentStyle={nfcCompactAccentStyle(dto.accentColorId)}
        shareUrl={dto.shareUrl}
      />
    </main>
  );
}

function toCompactCandidate(
  dto: PublicCareerProfileDTO,
  slug: string,
): CompactCandidate {
  const current = dto.experience.find((w) => w.isCurrent) ?? dto.experience[0];
  const edu = dto.education[0];
  const years = completedYearsOfExperience(dto);
  const skills = dto.skills.flatMap((g) => g.keywords).slice(0, 12);
  return {
    name: dto.name,
    initials: dto.initials,
    headline: dto.headline ?? "",
    currentRole: current?.position,
    currentCompany: current?.company ?? undefined,
    portrait: dto.profilePhotoUrl ?? undefined,
    cover: dto.coverPhotoUrl,
    coverFocalX: dto.coverPhotoPosition.focalX,
    coverFocalY: dto.coverPhotoPosition.focalY,
    coverZoom: dto.coverPhotoPosition.zoom,
    // No public phone/email fields exist on the candidate DTO — never
    // synthesize them (see PublicCareerProfileDTO contract).
    linkedin: dto.links.linkedin,
    github: dto.links.github,
    whatsappUrl: dto.whatsappUrl,
    website: dto.links.website,
    professionalSummary: dto.bio ?? undefined,
    skills,
    education: edu
      ? {
          degree:
            [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ") ||
            edu.institution,
          institution:
            edu.degree || edu.fieldOfStudy ? edu.institution : undefined,
        }
      : null,
    yearsExperience: years >= 1 ? years : undefined,
    experienceSummary: current
      ? `${current.position}${current.company ? ` · ${current.company}` : ""}`
      : undefined,
    certifications: dto.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer ?? undefined,
    })),
    portfolioAvailable: !!dto.featuredResume,
    resumeAvailable: !!dto.featuredResume,
    portfolioHref: dto.featuredResume ? `/u/${slug}/resume` : null,
    availability: dto.openToOpportunities ? "Open to opportunities" : null,
  };
}

function toCompactCompany(
  c: CompanyProfileDTO,
  dto: PublicCareerProfileDTO,
): CompactCompany {
  return {
    companyName: c.companyName,
    logo: c.logoUrl ?? undefined,
    cover: dto.coverPhotoUrl,
    coverFocalX: dto.coverPhotoPosition.focalX,
    coverFocalY: dto.coverPhotoPosition.focalY,
    coverZoom: dto.coverPhotoPosition.zoom,
    tagline: c.tagline ?? undefined,
    contactPerson: c.contactPersonName ?? undefined,
    contactPersonRole: c.contactPersonRole ?? undefined,
    publicPhone: c.publicPhone,
    publicEmail: c.publicEmail,
    whatsappUrl: c.whatsappUrl,
    website: c.links.website,
    linkedin: c.links.linkedin,
    facebook: c.links.facebook,
    instagram: c.links.instagram,
    x: c.links.x,
    youtube: c.links.youtube,
    tiktok: c.links.tiktok,
    about: c.about ?? undefined,
    industry: c.industry ?? undefined,
    locations: c.locations,
    services: c.services,
    hiringOpen: c.hiringOpen,
    openRolesSummary: c.openRolesSummary ?? undefined,
    openRolesUrl: c.openRolesUrl,
    companyProfileSummary: c.companyProfileSummary ?? undefined,
    companyProfileUrl: c.companyProfileUrl,
  };
}

function candidateCta(
  c: CompactCandidate,
): { href: string; label: string } | null {
  if (c.whatsappUrl) {
    return { href: c.whatsappUrl, label: "Chat on WhatsApp" };
  }
  const href = c.linkedin ?? c.website ?? c.portfolioHref ?? null;
  return href ? { href, label: "Get in Touch" } : null;
}

function companyCta(c: CompactCompany): { href: string; label: string } | null {
  if (c.whatsappUrl) return { href: c.whatsappUrl, label: "Chat on WhatsApp" };
  const href = c.publicEmail
    ? `mailto:${c.publicEmail}`
    : (c.website ??
      c.linkedin ??
      (c.publicPhone ? `tel:${c.publicPhone}` : null));
  return href ? { href, label: "Contact Us" } : null;
}
