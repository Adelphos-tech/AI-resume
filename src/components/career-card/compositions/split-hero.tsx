import { FileText, AtSign, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import { StatRail } from "@/components/career-card/primitives/stat-rail";
import type {
  DEMO_CAREER_PROFILE,
  DemoMedia,
} from "@/components/career-card/dev/demo-career-profile";

type P = typeof DEMO_CAREER_PROFILE;

/**
 * Split hero — Corporate family. Two explicit regions: a media column
 * (cover + portrait) and a structured identity column. On mobile the
 * regions stack but stay left-aligned and sectioned — never cinematic.
 */
export function SplitHero({ d, media }: { d: P; media: DemoMedia }) {
  const cover = media === "none" ? undefined : d.covers[media];
  return (
    <section aria-label="Profile" className="mx-auto max-w-4xl px-3">
      <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md lg:grid-cols-[1.05fr_1fr]">
        {/* Media region */}
        <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-950 lg:h-auto lg:min-h-72">
          <CareerCover
            src={cover}
            mode={cover ? "split" : "none"}
            focalY={0.45}
            zoom={1.1}
            className="absolute inset-0"
            fallbackClassName="bg-gradient-to-br from-slate-700/40 to-slate-900"
          />
          <CareerAvatar
            src={d.portrait}
            initials={d.initials}
            name={d.name}
            size="md"
            className="absolute bottom-4 left-5 lg:bottom-6"
            ringClassName="ring-4 ring-white"
            fallbackClassName="bg-slate-800 text-white"
          />
        </div>
        {/* Identity region — structured, left-aligned */}
        <div className="p-5 sm:p-6 lg:p-7">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {d.name}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {d.headline}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {d.location}
            </span>
            {d.openToOpportunities && (
              <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Open to opportunities
              </span>
            )}
          </div>
          <div className="my-4 border-t border-stone-200" />
          <StatRail className="justify-start gap-6">
            <StatItem
              value={`${d.yearsExperience}+`}
              label="YEARS"
              valueClassName="text-lg font-bold text-slate-900"
              labelClassName="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              className="text-left"
            />
            <StatItem
              value={d.projectsCount}
              label="PROJECTS"
              valueClassName="text-lg font-bold text-slate-900"
              labelClassName="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              className="text-left"
            />
            <StatItem
              value={d.companiesCount}
              label="COMPANIES"
              valueClassName="text-lg font-bold text-slate-900"
              labelClassName="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              className="text-left"
            />
          </StatRail>
          <div className="my-4 border-t border-stone-200" />
          <div className="flex flex-wrap items-center gap-2">
            {d.hasResume && (
              <ActionPill
                href="#resume"
                icon={<FileText className="size-4" />}
                label="View Resume"
                variant="primary"
                className="rounded-md bg-slate-800 text-white shadow-sm hover:bg-slate-700"
              />
            )}
            <ActionPill
              href={d.links.linkedin}
              icon={<AtSign className="size-4" />}
              label="LinkedIn"
              className="rounded-md border border-stone-300 text-stone-700 hover:border-slate-500"
            />
            <ActionPill
              href={d.links.github}
              icon={<FolderGit2 className="size-4" />}
              label="GitHub"
              className="rounded-md border border-stone-300 text-stone-700 hover:border-slate-500"
            />
            <ActionPill
              href={d.links.website}
              icon={<Globe className="size-4" />}
              label="Website"
              className="rounded-md border border-stone-300 text-stone-700 hover:border-slate-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
