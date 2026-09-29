import { FileText, AtSign, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import { StatRail } from "@/components/career-card/primitives/stat-rail";
import {
  CORPORATE_ACCENT_VARS,
  type CorporateAccent,
} from "@/components/career-card/primitives/corporate-accent";
import type {
  CareerCoverSpec,
  CinematicIdentity,
} from "@/components/career-card/compositions/cinematic-hero";

/**
 * Split hero — Corporate family. Two explicit regions: a media column
 * (cover + portrait) and a structured identity column. On mobile the
 * regions stack but stay left-aligned and sectioned — never cinematic.
 */
export function SplitHero({
  d,
  cover,
  accent = "neutral",
}: {
  d: CinematicIdentity;
  cover?: CareerCoverSpec;
  accent?: CorporateAccent;
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
      className="mx-auto max-w-4xl px-3"
      style={CORPORATE_ACCENT_VARS[accent]}
    >
      <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md lg:grid-cols-[1.05fr_1fr]">
        {/* Media region */}
        <div className="relative h-44 lg:h-auto lg:min-h-72">
          <CareerCover
            src={cover?.src}
            mode={cover ? "split" : "none"}
            focalX={cover?.focalX ?? 0.5}
            focalY={cover?.focalY ?? 0.45}
            zoom={cover?.zoom ?? 1.1}
            className="absolute inset-0"
            fallbackClassName="bg-[image:var(--cc-c-cover-bg)]"
          />
          <CareerAvatar
            src={d.portrait}
            focalX={d.portraitFocal?.focalX}
            focalY={d.portraitFocal?.focalY}
            zoom={d.portraitFocal?.zoom}
            initials={d.initials}
            name={d.name}
            size="md"
            className="absolute bottom-4 left-5 lg:bottom-6"
            ringClassName="ring-4 ring-white"
            fallbackClassName="bg-[var(--cc-c-avatar)] text-white"
          />
        </div>
        {/* Identity region — structured, left-aligned */}
        <div className="p-5 sm:p-6 lg:p-7">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {d.name}
          </h1>
          {d.headline && (
            <p className="mt-1 text-sm font-medium text-slate-600">
              {d.headline}
            </p>
          )}
          {(d.location || d.openToOpportunities) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              {d.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {d.location}
                </span>
              )}
              {d.openToOpportunities && (
                <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Open to opportunities
                </span>
              )}
            </div>
          )}
          {facts.length > 0 && (
            <>
              <div className="my-4 border-t border-stone-200" />
              <StatRail className="justify-start gap-6">
                {facts.map((f) => (
                  <StatItem
                    key={f.l}
                    value={f.v!}
                    label={f.l}
                    valueClassName="text-lg font-bold text-slate-900"
                    labelClassName="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                    className="text-left"
                  />
                ))}
              </StatRail>
            </>
          )}
          {(d.hasResume || pills.length > 0) && (
            <>
              <div className="my-4 border-t border-stone-200" />
              <div className="flex flex-wrap items-center gap-2">
                {d.hasResume && (
                  <ActionPill
                    href={d.resumeHref ?? "#resume"}
                    icon={<FileText className="size-4" />}
                    label="View Resume"
                    variant="primary"
                    className="rounded-md bg-[var(--cc-c-btn)] text-white shadow-sm hover:bg-[var(--cc-c-btn-hover)]"
                  />
                )}
                {pills.map((l) => (
                  <ActionPill
                    key={l.label}
                    href={l.href!}
                    icon={<l.icon className="size-4" />}
                    label={l.label}
                    className="rounded-md border border-stone-300 text-stone-700 hover:border-[color:var(--cc-c-btn-hover)]"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
