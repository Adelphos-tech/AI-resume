import type { PublicCareerProfileDTO } from "@/server/public-profile/public-profile";
import type {
  CareerCoverSpec,
  CinematicIdentity,
} from "@/components/career-card/compositions/cinematic-hero";
import type {
  DemoCertification,
  DemoEducation,
  DemoExperience,
  DemoLanguage,
  DemoProject,
  DemoResume,
} from "@/components/career-card/dev/demo-career-profile";

/**
 * PublicProfileDTO → Career Card semantic model.
 * The library stays DTO-agnostic; this adapter owns production translation.
 * Public-safe fields only — no fabrication, no AI.
 */

function careerDate(d: string | null): string | undefined {
  if (!d) return undefined;
  const [y, m] = d.split("-");
  if (!m) return y;
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** Mirrors production Premium: valid merged intervals, current→now, completed yrs, <1 omitted. */
export function completedYearsOfExperience(
  dto: PublicCareerProfileDTO,
): number {
  const now = new Date();
  const intervals: [number, number][] = [];
  for (const e of dto.experience) {
    if (!e.startDate) continue;
    const start = new Date(e.startDate).getTime();
    if (Number.isNaN(start)) continue;
    const end = e.isCurrent
      ? now.getTime()
      : e.endDate
        ? new Date(e.endDate).getTime()
        : NaN;
    if (Number.isNaN(end) || end <= start) continue;
    intervals.push([start, end]);
  }
  if (!intervals.length) return 0;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [intervals[0]!];
  for (const [s, e] of intervals.slice(1)) {
    const last = merged[merged.length - 1]!;
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return Math.floor(
    merged.reduce((sum, [s, e]) => sum + (e - s), 0) /
      (365.25 * 24 * 60 * 60 * 1000),
  );
}

export function publicProfileToCareerCard(
  dto: PublicCareerProfileDTO,
  slug: string,
): {
  identity: CinematicIdentity;
  cover: CareerCoverSpec | undefined;
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
  education: DemoEducation[];
  certifications: DemoCertification[];
  languages: DemoLanguage[];
  resume: DemoResume | undefined;
} {
  const resumeHref = `/u/${slug}/resume`;
  const companies = new Set(dto.experience.map((e) => e.company)).size;
  return {
    identity: {
      name: dto.name,
      initials: dto.initials,
      headline: dto.headline,
      location: dto.location,
      openToOpportunities: dto.openToOpportunities,
      portrait: dto.profilePhotoUrl ?? undefined,
      portraitFocal: dto.profilePhotoUrl
        ? {
            focalX: dto.profilePhotoPosition.focalX,
            focalY: dto.profilePhotoPosition.focalY,
            zoom: dto.profilePhotoPosition.zoom,
          }
        : undefined,
      yearsExperience: completedYearsOfExperience(dto) || undefined,
      projectsCount: dto.projects.length || undefined,
      companiesCount: companies || undefined,
      certificationsCount: dto.certifications.length || undefined,
      hasResume: !!dto.featuredResume,
      resumeHref,
      links: {
        linkedin: dto.links.linkedin ?? undefined,
        github: dto.links.github ?? undefined,
        website: dto.links.website ?? undefined,
      },
    },
    cover: dto.coverPhotoUrl
      ? {
          src: dto.coverPhotoUrl,
          focalX: dto.coverPhotoPosition.focalX,
          focalY: dto.coverPhotoPosition.focalY,
          zoom: dto.coverPhotoPosition.zoom,
        }
      : undefined,
    experience: dto.experience.map((e) => ({
      position: e.position,
      company: e.company,
      start: careerDate(e.startDate) ?? "",
      end: careerDate(e.endDate),
      current: e.isCurrent,
      location: e.location ?? undefined,
      summary: e.summary ?? undefined,
      highlights: e.highlights.length ? e.highlights : undefined,
    })),
    projects: dto.projects.map((p) => ({
      name: p.name,
      description: p.description ?? "",
      url: p.url ?? undefined,
    })),
    skills: dto.skills.flatMap((g) => g.keywords),
    education: dto.education.map((e) => ({
      degree: e.degree ?? "",
      fieldOfStudy: e.fieldOfStudy ?? undefined,
      institution: e.institution,
      start: careerDate(e.startDate),
      end: careerDate(e.endDate),
      location: e.location ?? undefined,
      description: e.highlights.length ? e.highlights.join(" ") : undefined,
    })),
    certifications: dto.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer ?? undefined,
      issued: careerDate(c.date),
      credentialUrl: c.url ?? undefined,
    })),
    languages: dto.languages.map((l) => ({
      language: l.language,
      proficiency: l.fluency ?? undefined,
    })),
    resume: dto.featuredResume
      ? { hasResume: true, title: dto.featuredResume.name, href: resumeHref }
      : undefined,
  };
}
