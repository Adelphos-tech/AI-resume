import { AtSign, FileText, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { GlassSurface } from "@/components/career-card/primitives/glass-surface";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import { StatRail } from "@/components/career-card/primitives/stat-rail";
import {
  CINEMATIC_ACCENT_VARS,
  type CinematicAccent,
} from "@/components/career-card/primitives/cinematic-accent";

/** Cover image spec — real focal/zoom or a demo image without metadata. */
export type CareerCoverSpec = {
  src: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
};

/** Identity model for the Cinematic hero — demo and DTO-adapter shaped. */
export type CinematicIdentity = {
  name: string;
  initials: string;
  headline?: string | null;
  location?: string | null;
  openToOpportunities?: boolean;
  portrait?: string;
  portraitFocal?: { focalX?: number; focalY?: number; zoom?: number };
  yearsExperience?: number;
  projectsCount?: number;
  companiesCount?: number;
  certificationsCount?: number;
  hasResume?: boolean;
  resumeHref?: string;
  links?: {
    linkedin?: string | null;
    github?: string | null;
    website?: string | null;
  };
};

/**
 * Cinematic hero — Executive family. Cover, portrait, identity, facts and
 * actions read as ONE continuous object. Accent-aware via CINEMATIC
 * accent CSS variables (default = lab violet).
 */
export function CinematicHero({
  d,
  cover,
  accent = "violet",
}: {
  d: CinematicIdentity;
  cover?: CareerCoverSpec;
  accent?: CinematicAccent;
}) {
  const facts = [
    { v: d.yearsExperience ? `${d.yearsExperience}+` : null, l: "YEARS" },
    { v: d.projectsCount || null, l: "PROJECTS" },
    { v: d.companiesCount || null, l: "COMPANIES" },
    { v: d.certificationsCount || null, l: "CERTS" },
  ].filter((f) => f.v !== null);
  const pills = [
    { href: d.links?.linkedin, icon: AtSign, label: "LinkedIn" },
    { href: d.links?.github, icon: FolderGit2, label: "GitHub" },
    { href: d.links?.website, icon: Globe, label: "Website" },
  ].filter((l) => l.href);
  return (
    <section
      aria-label="Profile"
      className="mx-auto max-w-5xl px-3"
      style={CINEMATIC_ACCENT_VARS[accent]}
    >
      <div className="relative">
        <CareerCover
          src={cover?.src}
          mode={cover ? "cinematic" : "none"}
          focalX={cover?.focalX ?? 0.5}
          focalY={cover?.focalY ?? 0.4}
          zoom={cover?.zoom ?? 1.08}
          className="h-48 rounded-2xl sm:h-56 lg:h-64"
          fallbackClassName="bg-[image:var(--cc-cover-bg)]"
        />
        {/* Portrait overlaps the cover edge — centered mobile, left-anchored desktop */}
        <CareerAvatar
          src={d.portrait}
          focalX={d.portraitFocal?.focalX}
          focalY={d.portraitFocal?.focalY}
          zoom={d.portraitFocal?.zoom}
          initials={d.initials}
          name={d.name}
          size="lg"
          className="absolute left-1/2 top-full z-30 -translate-x-1/2 -translate-y-1/2 lg:left-20 lg:translate-x-0"
          ringClassName="ring-4 ring-[color:var(--cc-ring)]"
          haloClassName="bg-[var(--cc-halo)]"
          fallbackClassName="bg-[var(--cc-btn2)] text-white"
        />
      </div>
      <GlassSurface className="relative z-20 -mt-16 p-5 pt-32 sm:px-6 lg:-mt-14 lg:pt-5">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cc-edge-hi)] to-transparent"
        />
        <div className="lg:grid lg:grid-cols-[12rem_1fr_auto] lg:items-center lg:gap-6">
          {/* col 1 is the portrait's reserved space on desktop */}
          <div aria-hidden className="hidden lg:block" />
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {d.name}
            </h1>
            {d.headline && (
              <p className="mt-1.5 text-sm font-medium text-[color:var(--cc-text)]/90">
                {d.headline}
              </p>
            )}
            {(d.location || d.openToOpportunities) && (
              <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-stone-400 lg:justify-start">
                {d.location && (
                  <>
                    <MapPin className="size-3.5" aria-hidden />
                    {d.location}
                  </>
                )}
                {d.openToOpportunities && (
                  <span className="ml-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Open to opportunities
                  </span>
                )}
              </div>
            )}
          </div>
          {facts.length > 0 && (
            <div className="mt-4 lg:mt-0">
              <StatRail
                divided
                dividerClassName="divide-white/10"
                className="gap-2"
              >
                {facts.map((f) => (
                  <StatItem
                    key={f.l}
                    value={f.v!}
                    label={f.l}
                    valueClassName="text-xl font-bold text-[color:var(--cc-text)]"
                    labelClassName="text-[10px] font-medium uppercase tracking-wider text-stone-400"
                    className="min-w-16"
                  />
                ))}
              </StatRail>
            </div>
          )}
        </div>
        {(d.hasResume || pills.length > 0) && (
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-2 lg:justify-end">
            {d.hasResume && (
              <ActionPill
                href={d.resumeHref ?? "#resume"}
                icon={<FileText className="size-4" />}
                label="View Resume"
                variant="primary"
                className="w-full rounded-lg bg-gradient-to-b from-[var(--cc-btn1)] to-[var(--cc-btn2)] text-white shadow-[0_8px_24px_-6px_var(--cc-btn-glow)] sm:w-auto"
              />
            )}
            {pills.map((l) => (
              <ActionPill
                key={l.label}
                href={l.href!}
                icon={<l.icon className="size-4" />}
                label={l.label}
                className="rounded-full border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] text-[color:var(--cc-pill,var(--cc-text))]"
              />
            ))}
          </div>
        )}
      </GlassSurface>
    </section>
  );
}
