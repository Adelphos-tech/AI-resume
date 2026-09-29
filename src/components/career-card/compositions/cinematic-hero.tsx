import { FileText, AtSign, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { GlassSurface } from "@/components/career-card/primitives/glass-surface";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import { StatRail } from "@/components/career-card/primitives/stat-rail";
import type {
  DEMO_CAREER_PROFILE,
  DemoMedia,
} from "@/components/career-card/dev/demo-career-profile";

type P = typeof DEMO_CAREER_PROFILE;

/**
 * Cinematic hero — Executive family. Cover, portrait, identity, facts and
 * actions read as ONE continuous object: the image bleeds into a glass
 * identity surface rather than sitting above a separate box.
 * Mobile: centered immersive stack. Desktop: horizontal composition —
 * portrait anchored left, identity grid spreads across the panel.
 */
export function CinematicHero({ d, media }: { d: P; media: DemoMedia }) {
  const cover = media === "none" ? undefined : d.covers[media];
  const facts = [
    { v: d.yearsExperience ? `${d.yearsExperience}+` : null, l: "YEARS" },
    { v: d.projectsCount || null, l: "PROJECTS" },
    { v: d.companiesCount || null, l: "COMPANIES" },
    { v: d.certificationsCount || null, l: "CERTS" },
  ].filter((f) => f.v !== null);
  return (
    <section aria-label="Profile" className="mx-auto max-w-5xl px-3">
      <div className="relative">
        <CareerCover
          src={cover}
          mode={cover ? "cinematic" : "none"}
          focalY={40}
          zoom={1.08}
          className="h-48 rounded-2xl sm:h-56 lg:h-64"
          fallbackClassName="bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(167,139,250,0.28),transparent_60%),radial-gradient(ellipse_70%_60%_at_5%_100%,rgba(124,58,237,0.16),transparent),linear-gradient(165deg,#231b4b_0%,#17121f_45%,#0c0a09_100%)]"
        />
        {/* Portrait overlaps the cover edge — centered mobile, left-anchored desktop */}
        <CareerAvatar
          src={d.portrait}
          initials={d.initials}
          name={d.name}
          size="lg"
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-full z-30 lg:left-20 lg:translate-x-0"
          ringClassName="ring-4 ring-violet-400/40"
          haloClassName="bg-violet-500/25"
        />
      </div>
      <GlassSurface className="relative z-20 -mt-16 p-5 pt-16 sm:px-6 lg:-mt-14 lg:pt-5">
        <div className="lg:grid lg:grid-cols-[7.5rem_1fr_auto] lg:items-center lg:gap-6">
          {/* col 1 is the portrait's reserved space on desktop */}
          <div aria-hidden className="hidden lg:block" />
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {d.name}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-violet-300/90">
              {d.headline}
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-stone-400 lg:justify-start">
              <MapPin className="size-3.5" aria-hidden />
              {d.location}
              {d.openToOpportunities && (
                <span className="ml-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Open to opportunities
                </span>
              )}
            </div>
          </div>
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
                  valueClassName="text-xl font-bold text-violet-300"
                  labelClassName="text-[10px] font-medium uppercase tracking-wider text-stone-400"
                  className="min-w-16"
                />
              ))}
            </StatRail>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-stretch justify-center gap-2 lg:justify-end">
          {d.hasResume && (
            <ActionPill
              href="#resume"
              icon={<FileText className="size-4" />}
              label="View Resume"
              variant="primary"
              className="w-full rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_8px_24px_-6px_rgba(139,92,246,0.45)] sm:w-auto"
            />
          )}
          <ActionPill
            href={d.links.linkedin}
            icon={<AtSign className="size-4" />}
            label="LinkedIn"
            className="rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-200"
          />
          <ActionPill
            href={d.links.github}
            icon={<FolderGit2 className="size-4" />}
            label="GitHub"
            className="rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-200"
          />
          <ActionPill
            href={d.links.website}
            icon={<Globe className="size-4" />}
            label="Website"
            className="rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-200"
          />
        </div>
      </GlassSurface>
    </section>
  );
}
