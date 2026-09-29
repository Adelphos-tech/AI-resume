import { ArrowUpRight } from "lucide-react";
import type {
  DemoExperience,
  DemoProject,
} from "@/components/career-card/dev/demo-career-profile";
import {
  ExperienceBullets,
  formatRange,
} from "@/components/career-card/modules/experience-content";

const sectionTitle =
  "border-b border-stone-200 pb-2 text-xs font-bold uppercase tracking-widest text-slate-500";

/**
 * Corporate career sections — structured, credible, scannable rows with an
 * aligned date column. No cinematic chrome; reads like a strong business
 * document inside a contained panel.
 */
export function CorporateCareerSections({
  experience,
  projects,
  skills,
}: {
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
}) {
  return (
    <div className="mx-auto mt-6 max-w-4xl space-y-6 px-3 pb-10">
      {experience.length > 0 && (
        <section
          aria-labelledby="corp-exp"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="corp-exp" className={sectionTitle}>
            Experience
          </h2>
          <div className="divide-y divide-stone-100">
            {experience.map((r, i) => (
              <div
                key={i}
                className="grid gap-x-5 gap-y-1 py-4 first:pt-5 last:pb-0 sm:grid-cols-[7.5rem_1fr]"
              >
                <div className="text-xs font-medium leading-6 text-slate-400 sm:text-right">
                  {formatRange(r)}
                  {r.current && (
                    <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 sm:ml-0 sm:mt-1 sm:block sm:w-fit sm:text-right">
                      Current
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-stone-900">
                    {r.position}
                    <span className="font-normal text-slate-500">
                      {" "}
                      — {r.company}
                    </span>
                  </h3>
                  {r.location && (
                    <p className="text-xs text-stone-400">{r.location}</p>
                  )}
                  {r.summary && (
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                      {r.summary}
                    </p>
                  )}
                  {r.highlights && (
                    <ExperienceBullets
                      items={r.highlights}
                      className="mt-1.5 space-y-1 text-[13px] text-stone-500"
                      markerClassName="bg-slate-300"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section
          aria-labelledby="corp-proj"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="corp-proj" className={sectionTitle}>
            Projects
          </h2>
          <div className="divide-y divide-stone-100">
            {projects.map((p) => (
              <div
                key={p.name}
                className="flex items-baseline justify-between gap-4 py-3.5 first:pt-4 last:pb-0"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {p.name}
                    {p.role && (
                      <span className="ml-2 text-xs font-medium text-slate-400">
                        {p.role}
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-stone-500">
                    {p.description}
                  </p>
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${p.name}`}
                    className="shrink-0 rounded-md border border-stone-200 p-1.5 text-slate-500 transition hover:border-slate-400"
                  >
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section
          aria-labelledby="corp-skills"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="corp-skills" className={sectionTitle}>
            Skills
          </h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
