import { ArrowUpRight } from "lucide-react";
import type {
  DemoCertification,
  DemoEducation,
  DemoExperience,
  DemoLanguage,
  DemoProject,
  DemoResume,
} from "@/components/career-card/dev/demo-career-profile";
import {
  ExperienceBullets,
  formatRange,
} from "@/components/career-card/modules/experience-content";
import { skillLine } from "@/components/career-card/modules/skills-content";
import {
  degreeLine,
  formatEducationRange,
} from "@/components/career-card/modules/education-content";
import { credentialMeta } from "@/components/career-card/modules/certifications-content";
import { languageLine } from "@/components/career-card/modules/languages-content";
import { FileText } from "lucide-react";
import {
  CINEMATIC_ACCENT_VARS,
  type CinematicAccent,
} from "@/components/career-card/primitives/cinematic-accent";

/**
 * Executive career sections — career-story vertical timeline + selected-work
 * showcase + restrained expertise rail. Dark, accent-led, no generic cards.
 */
export function ExecutiveCareerSections({
  experience,
  projects,
  skills,
  education = [],
  certifications = [],
  languages = [],
  resume,
  accent = "violet",
}: {
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
  education?: DemoEducation[];
  certifications?: DemoCertification[];
  languages?: DemoLanguage[];
  resume?: DemoResume;
  accent?: CinematicAccent;
}) {
  const [featured, ...rest] = projects;
  return (
    <div
      className="mx-auto mt-10 max-w-5xl space-y-12 px-3 pb-10"
      style={CINEMATIC_ACCENT_VARS[accent]}
    >
      {/* ── Career timeline ─────────────────────────────────────────── */}
      {experience.length > 0 && (
        <section aria-labelledby="exec-exp">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
            Career Path
          </p>
          <h2 id="exec-exp" className="mt-1 text-xl font-bold text-white">
            Experience
          </h2>
          <div className="relative mt-6 ml-2 space-y-8 border-l-2 border-[color:var(--cc-edge)] pl-6">
            {experience.map((r, i) => (
              <div key={i} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0c0a09] ${
                    r.current ? "bg-[var(--cc-accent)]" : "bg-stone-600"
                  }`}
                />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-semibold text-white">{r.position}</h3>
                  <span className="text-xs text-stone-400">
                    {r.company}
                    {r.location ? ` · ${r.location}` : ""}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-[color:var(--cc-text)]">
                  {formatRange(r)}
                  {r.current && (
                    <span className="ml-2 rounded-full border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
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
                    markerClassName="bg-[var(--cc-accent)]"
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
            Selected Work
          </p>
          <h2 id="exec-proj" className="mt-1 text-xl font-bold text-white">
            Projects
          </h2>
          {featured && (
            <a
              href={featured.url ?? "#"}
              className="group relative mt-5 block overflow-hidden rounded-xl border border-[color:var(--cc-edge)] bg-gradient-to-br from-[var(--cc-feature)] to-stone-900/60 p-5 transition hover:border-[color:var(--cc-edge-hi)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {featured.name}
                  </h3>
                  {featured.role && (
                    <p className="mt-0.5 text-xs font-medium text-[color:var(--cc-text)]">
                      {featured.role}
                    </p>
                  )}
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
                    {featured.description}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden
                  className="size-5 shrink-0 text-[color:var(--cc-accent)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
            Expertise
          </p>
          <div className="mt-3 border-t border-[color:var(--cc-edge)] pt-4">
            <p className="text-[15px] font-medium leading-relaxed text-stone-200">
              {skillLine(skills, "  ·  ")}
            </p>
          </div>
        </section>
      )}

      {/* ── Education + Credentials — paired, supporting ──────────── */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {education.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
                Education
              </p>
              <div className="mt-4 space-y-4">
                {education.map((e, i) => (
                  <div key={i} className="border-l-2 border-stone-800 pl-4">
                    <h3 className="text-sm font-semibold text-white">
                      {degreeLine(e)}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {e.institution}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                      {formatEducationRange(e)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
                Credentials
              </p>
              <div className="mt-4 space-y-4">
                {certifications.map((c) => (
                  <div
                    key={c.name}
                    className="border-l-2 border-[color:var(--cc-edge-hi)] pl-4"
                  >
                    <h3 className="text-sm font-semibold text-white">
                      {c.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {credentialMeta(c)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Languages — compact ─────────────────────────────────────── */}
      {languages.length > 0 && (
        <section aria-labelledby="exec-langs">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
            Languages
          </p>
          <p className="mt-3 text-sm text-stone-300">
            {languages.map(languageLine).join("  ·  ")}
          </p>
        </section>
      )}

      {/* ── Résumé — premium closing band ───────────────────────────── */}
      {resume?.hasResume && (
        <section>
          <a
            href={resume.href ?? "#resume"}
            className="group flex items-center justify-between gap-4 border-t-2 border-[color:var(--cc-edge-hi)] pt-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] text-[color:var(--cc-text)]">
                <FileText className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]">
                  Résumé
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {resume.title ?? "View my professional résumé"}
                </p>
              </div>
            </div>
            <ArrowUpRight
              aria-hidden
              className="size-5 shrink-0 text-[color:var(--cc-accent)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </section>
      )}
    </div>
  );
}
