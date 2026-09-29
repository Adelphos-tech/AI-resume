import { ArrowUpRight } from "lucide-react";
import type {
  DemoExperience,
  DemoProject,
} from "@/components/career-card/dev/demo-career-profile";
import {
  ExperienceBullets,
  formatRange,
} from "@/components/career-card/modules/experience-content";
import { skillLine } from "@/components/career-card/modules/skills-content";

/**
 * Executive career sections — career-story vertical timeline + selected-work
 * showcase + restrained expertise rail. Dark, accent-led, no generic cards.
 */
export function ExecutiveCareerSections({
  experience,
  projects,
  skills,
}: {
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
}) {
  const [featured, ...rest] = projects;
  return (
    <div className="mx-auto mt-10 max-w-5xl space-y-12 px-3 pb-10">
      {/* ── Career timeline ─────────────────────────────────────────── */}
      {experience.length > 0 && (
        <section aria-labelledby="exec-exp">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/80">
            Career Path
          </p>
          <h2 id="exec-exp" className="mt-1 text-xl font-bold text-white">
            Experience
          </h2>
          <div className="relative mt-6 ml-2 space-y-8 border-l-2 border-violet-500/25 pl-6">
            {experience.map((r, i) => (
              <div key={i} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0c0a09] ${
                    r.current ? "bg-violet-400" : "bg-stone-600"
                  }`}
                />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-semibold text-white">{r.position}</h3>
                  <span className="text-xs text-stone-400">
                    {r.company}
                    {r.location ? ` · ${r.location}` : ""}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-violet-300/80">
                  {formatRange(r)}
                  {r.current && (
                    <span className="ml-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </p>
                {r.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-stone-300">
                    {r.summary}
                  </p>
                )}
                {r.highlights && (
                  <ExperienceBullets
                    items={r.highlights}
                    className="mt-2 space-y-1 text-sm text-stone-400"
                    markerClassName="bg-violet-400/70"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Selected Work ───────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section aria-labelledby="exec-proj">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/80">
            Selected Work
          </p>
          <h2 id="exec-proj" className="mt-1 text-xl font-bold text-white">
            Projects
          </h2>
          {featured && (
            <a
              href={featured.url ?? "#"}
              className="group relative mt-5 block overflow-hidden rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-stone-900/60 p-5 transition hover:border-violet-500/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {featured.name}
                  </h3>
                  {featured.role && (
                    <p className="mt-0.5 text-xs font-medium text-violet-300/80">
                      {featured.role}
                    </p>
                  )}
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
                    {featured.description}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden
                  className="size-5 shrink-0 text-violet-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
            </a>
          )}
          {rest.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <a
                  key={p.name}
                  href={p.url ?? "#"}
                  className="group rounded-xl border border-stone-800 bg-stone-900/60 p-4 transition hover:border-stone-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {p.name}
                    </h4>
                    {p.url && (
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-stone-500"
                      />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                    {p.description}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Expertise rail ──────────────────────────────────────────── */}
      {skills.length > 0 && (
        <section aria-labelledby="exec-skills">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/80">
            Expertise
          </p>
          <div className="mt-3 border-t border-violet-500/25 pt-4">
            <p className="text-[15px] font-medium leading-relaxed text-stone-200">
              {skillLine(skills, "  ·  ")}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
