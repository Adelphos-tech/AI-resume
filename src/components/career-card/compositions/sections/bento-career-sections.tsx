import { ArrowUpRight } from "lucide-react";
import type {
  DemoCertification,
  DemoEducation,
  DemoExperience,
  DemoLanguage,
  DemoProject,
  DemoResume,
} from "@/components/career-card/dev/demo-career-profile";
import { formatRange } from "@/components/career-card/modules/experience-content";
import { ProjectTags } from "@/components/career-card/modules/projects-content";
import {
  degreeLine,
  formatEducationRange,
} from "@/components/career-card/modules/education-content";
import { credentialMeta } from "@/components/career-card/modules/certifications-content";
import { languageLine } from "@/components/career-card/modules/languages-content";
import { FileText } from "lucide-react";

const cell = "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm";
const label =
  "font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-400";

/**
 * Tech/Minimal-Bento career sections — the hero's cell mosaic continues:
 * role cells, variable-size project cells, compact skill chips.
 */
export function BentoCareerSections({
  experience,
  projects,
  skills,
  education = [],
  certifications = [],
  languages = [],
  resume,
}: {
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
  education?: DemoEducation[];
  certifications?: DemoCertification[];
  languages?: DemoLanguage[];
  resume?: DemoResume;
}) {
  const [featured, ...rest] = projects;
  return (
    <div className="mx-auto mt-6 max-w-3xl space-y-6 px-3 pb-10">
      {experience.length > 0 && (
        <section aria-labelledby="bento-exp">
          <h2 id="bento-exp" className={`${label} mb-3`}>
            experience/
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {experience.map((r, i) => (
              <div
                key={i}
                className={`${cell} ${i === 0 ? "border-t-2 border-t-blue-300 sm:col-span-2" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900">
                      {r.position}
                    </h3>
                    <p className="font-mono text-xs text-neutral-500">
                      {r.company}
                      {r.location ? ` · ${r.location}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                    {formatRange(r)}
                  </span>
                </div>
                {r.current && (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-blue-700">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                    current
                  </span>
                )}
                {r.summary && (
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                    {r.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section aria-labelledby="bento-proj">
          <h2 id="bento-proj" className={`${label} mb-3`}>
            projects/
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured && (
              <a
                href={featured.url ?? "#"}
                className={`${cell} group relative sm:col-span-2 ${
                  featured.url ? "" : "pointer-events-none"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {featured.name}
                  </h3>
                  {featured.url && (
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 shrink-0 text-blue-500"
                    />
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">
                  {featured.description}
                </p>
                <ProjectTags
                  tags={featured.tags}
                  className="mt-2.5"
                  tagClassName="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500"
                />
              </a>
            )}
            {rest.map((p) => (
              <a
                key={p.name}
                href={p.url ?? "#"}
                className={`${cell} group relative ${p.url ? "" : "pointer-events-none"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-neutral-900">
                    {p.name}
                  </h4>
                  {p.url && (
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-neutral-400"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {p.description}
                </p>
                <ProjectTags
                  tags={p.tags}
                  className="mt-2"
                  tagClassName="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section aria-labelledby="bento-skills">
          <h2 id="bento-skills" className={`${label} mb-3`}>
            skills/
          </h2>
          <div className={`${cell} flex flex-wrap gap-1.5`}>
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[11px] text-neutral-600"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section aria-labelledby="bento-edu">
          <h2 id="bento-edu" className={`${label} mb-3`}>
            education/
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {education.map((e, i) => (
              <div key={i} className={cell}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-bold text-neutral-900">
                    {degreeLine(e)}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                    {formatEducationRange(e)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-500">
                  {e.institution}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                    {e.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section aria-labelledby="bento-certs">
          <h2 id="bento-certs" className={`${label} mb-3`}>
            credentials/
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <div key={c.name} className={cell}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-bold text-neutral-900">
                    {c.name}
                  </h3>
                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${c.name} credential`}
                      className="shrink-0 text-blue-500"
                    >
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-neutral-500">
                  {credentialMeta(c)}
                  {c.expires ? ` → ${c.expires}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(languages.length > 0 || resume?.hasResume) && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {languages.length > 0 && (
            <div className={cell}>
              <h2 className={label}>languages/</h2>
              <ul className="mt-2.5 space-y-1.5">
                {languages.map((l) => (
                  <li
                    key={l.language}
                    className="font-mono text-[12px] text-neutral-600"
                  >
                    {languageLine(l)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resume?.hasResume && (
            <a
              href="#resume"
              className={`${cell} group flex items-center justify-between gap-3 border-t-2 border-t-blue-300`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <FileText
                  aria-hidden
                  className="size-4 shrink-0 text-blue-500"
                />
                <span className="min-w-0">
                  <span className={`${label} block`}>resume/</span>
                  <span className="mt-1 block truncate text-[13px] font-semibold text-neutral-900">
                    {resume.title ?? "View résumé"}
                  </span>
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 text-blue-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}
        </section>
      )}
    </div>
  );
}
