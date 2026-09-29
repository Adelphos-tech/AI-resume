import { FileText, AtSign, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import type {
  DEMO_CAREER_PROFILE,
  DemoMedia,
} from "@/components/career-card/dev/demo-career-profile";

type P = typeof DEMO_CAREER_PROFILE;

const cell = "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm";

/**
 * Minimal/Bento hero — Tech family. No dominant cover: identity is a
 * modular grid of cells. Cover imagery (when present) lives inside the
 * identity cell as ambient media, not as a banner.
 */
export function MinimalBentoHero({ d, media }: { d: P; media: DemoMedia }) {
  const cover = media === "none" ? undefined : d.covers[media];
  return (
    <section aria-label="Profile" className="mx-auto max-w-3xl px-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Identity cell */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-neutral-200 shadow-sm lg:row-span-2">
          {cover && (
            <CareerCover
              src={cover}
              mode="ambient"
              focalY={0.4}
              className="absolute inset-0"
            />
          )}
          <div
            className={`relative flex min-h-60 flex-col justify-end gap-3 p-4 pt-12 sm:p-5 ${
              cover
                ? "bg-gradient-to-t from-black/75 via-black/35 to-black/5 text-white"
                : "bg-white"
            }`}
          >
            <CareerAvatar
              src={d.portrait}
              initials={d.initials}
              name={d.name}
              size="md"
              ringClassName={
                cover ? "ring-2 ring-white/50" : "ring-2 ring-blue-200"
              }
              fallbackClassName="bg-blue-600 text-white"
            />
            <div>
              <h1
                className={`text-xl font-bold tracking-tight sm:text-2xl ${cover ? "" : "text-neutral-900"}`}
              >
                {d.name}
              </h1>
              <p
                className={`mt-1 font-mono text-[13px] ${cover ? "text-white/85" : "text-blue-700"}`}
              >
                {d.headline}
              </p>
            </div>
          </div>
        </div>
        {/* Location / status cell */}
        <div
          className={`${cell} col-span-2 flex items-center justify-between gap-2 lg:col-span-1`}
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="size-3.5" aria-hidden />
            {d.location}
          </span>
          {d.openToOpportunities && (
            <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Open
            </span>
          )}
        </div>
        {/* Fact cells — one per stat on desktop row */}
        <div
          className={`${cell} flex items-center justify-center !py-3 border-t-2 border-t-blue-200`}
        >
          <StatItem
            value={`${d.yearsExperience}+`}
            label="yrs exp"
            valueClassName="font-mono text-2xl font-bold leading-none text-neutral-900"
            labelClassName="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400"
          />
        </div>
        <div
          className={`${cell} flex items-center justify-center !py-3 border-t-2 border-t-blue-200`}
        >
          <StatItem
            value={d.projectsCount}
            label="projects"
            valueClassName="font-mono text-2xl font-bold leading-none text-neutral-900"
            labelClassName="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400"
          />
        </div>
        <div
          className={`${cell} flex items-center justify-center !py-3 border-t-2 border-t-blue-200`}
        >
          <StatItem
            value={d.companiesCount}
            label="companies"
            valueClassName="font-mono text-2xl font-bold leading-none text-neutral-900"
            labelClassName="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400"
          />
        </div>
        {/* Action cell */}
        <div
          className={`${cell} col-span-2 flex flex-wrap items-center justify-center gap-2 lg:col-span-4`}
        >
          {d.hasResume && (
            <ActionPill
              href="#resume"
              icon={<FileText className="size-4" />}
              label="View Resume"
              variant="primary"
              className="rounded-lg bg-blue-600 font-mono text-white hover:bg-blue-500"
            />
          )}
          <ActionPill
            href={d.links.linkedin}
            icon={<AtSign className="size-4" />}
            label="LinkedIn"
            className="rounded-lg border border-neutral-200 font-mono text-neutral-700 hover:border-blue-400"
          />
          <ActionPill
            href={d.links.github}
            icon={<FolderGit2 className="size-4" />}
            label="GitHub"
            className="rounded-lg border border-neutral-200 font-mono text-neutral-700 hover:border-blue-400"
          />
          <ActionPill
            href={d.links.website}
            icon={<Globe className="size-4" />}
            label="Website"
            className="rounded-lg border border-neutral-200 font-mono text-neutral-700 hover:border-blue-400"
          />
        </div>
      </div>
    </section>
  );
}
