import { FileText, AtSign, FolderGit2, Globe, MapPin } from "lucide-react";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { CareerCover } from "@/components/career-card/primitives/career-cover";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import type {
  DEMO_CAREER_PROFILE,
  DemoMedia,
} from "@/components/career-card/dev/demo-career-profile";

type P = typeof DEMO_CAREER_PROFILE;

/**
 * Editorial hero — Classic family. Typography leads: a thin media strip,
 * then a ruled, left-aligned professional identity block. Stats are
 * inline prose-style; actions are quiet text-forward controls.
 */
export function EditorialHero({ d, media }: { d: P; media: DemoMedia }) {
  const cover = media === "none" ? undefined : d.covers[media];
  const stats = [
    d.yearsExperience && `${d.yearsExperience}+ yrs experience`,
    d.projectsCount && `${d.projectsCount} projects`,
    d.companiesCount && `${d.companiesCount} companies`,
    d.certificationsCount && `${d.certificationsCount} credential`,
  ]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <section aria-label="Profile" className="mx-auto max-w-2xl px-4">
      {cover && (
        <CareerCover
          src={cover}
          mode="banner"
          focalY={35}
          zoom={1.05}
          className="h-14 rounded-t sm:h-16"
        />
      )}
      <div className="border-t-2 border-stone-800 pt-7">
        <div className="flex items-start gap-4 sm:gap-5">
          <CareerAvatar
            src={d.portrait}
            initials={d.initials}
            name={d.name}
            size="md"
            className="mt-1"
            ringClassName="ring-2 ring-stone-300"
            fallbackClassName="bg-stone-700 text-stone-100"
          />
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {d.name}
            </h1>
            <p className="mt-1 font-serif text-base italic leading-snug text-stone-600">
              {d.headline}
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {d.location}
          </span>
          {d.openToOpportunities && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              Open to opportunities
            </span>
          )}
        </div>
        <p className="mt-3 border-y border-stone-200 py-2.5 text-[13px] font-medium uppercase tracking-wider text-stone-500">
          {stats}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {d.hasResume && (
            <ActionPill
              href="#resume"
              icon={<FileText className="size-4" />}
              label="View Resume"
              variant="primary"
              className="-ml-4 rounded bg-emerald-700 px-4 text-sm text-white hover:bg-emerald-800"
            />
          )}
          <ActionPill
            href={d.links.linkedin}
            icon={<AtSign className="size-4" />}
            label="LinkedIn"
            className="-mx-2 px-2 text-sm text-emerald-800 underline-offset-4 hover:underline"
          />
          <ActionPill
            href={d.links.github}
            icon={<FolderGit2 className="size-4" />}
            label="GitHub"
            className="-mx-2 px-2 text-sm text-emerald-800 underline-offset-4 hover:underline"
          />
          <ActionPill
            href={d.links.website}
            icon={<Globe className="size-4" />}
            label="Website"
            className="-mx-2 px-2 text-sm text-emerald-800 underline-offset-4 hover:underline"
          />
        </div>
      </div>
    </section>
  );
}
