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
import {
  degreeLine,
  formatEducationRange,
} from "@/components/career-card/modules/education-content";
import { credentialMeta } from "@/components/career-card/modules/certifications-content";
import { languageLine } from "@/components/career-card/modules/languages-content";
import { FileText } from "lucide-react";

const h2 =
  "font-serif text-2xl font-bold tracking-tight text-stone-900 border-b-2 border-stone-800 pb-2";

/**
 * Classic editorial career sections — continuous typographic flow in the
 * measure established by the editorial hero. Rules and spacing, no boxes.
 */
export function EditorialCareerSections({
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
  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-12">
      {experience.length > 0 && (
        <section aria-labelledby="ed-exp">
          <h2 id="ed-exp" className={h2}>
            Experience
          </h2>
          <div className="mt-1 divide-y divide-stone-200">
            {experience.map((r, i) => (
              <article key={i} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {r.position}
                  </h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    {formatRange(r)}
                  </span>
                </div>
                <p className="mt-0.5 font-serif text-sm italic text-stone-600">
                  {r.company}
                  {r.location ? `, ${r.location}` : ""}
                </p>
                {r.summary && (
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-700">
                    {r.summary}
                  </p>
                )}
                {r.highlights && r.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {r.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-sm leading-relaxed text-stone-600 before:mr-2 before:text-stone-400 before:content-['—']"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section aria-labelledby="ed-proj">
          <h2 id="ed-proj" className={h2}>
            Projects
          </h2>
          <ol className="mt-4 space-y-5">
            {projects.map((p, i) => (
              <li key={p.name} className="flex gap-4">
                <span className="font-serif text-sm font-bold text-stone-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {p.name}
                    </h3>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 underline-offset-4 hover:underline"
                      >
                        <ArrowUpRight aria-hidden className="size-3" />
                        Link
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    {p.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {skills.length > 0 && (
        <section aria-labelledby="ed-skills">
          <h2 id="ed-skills" className={h2}>
            Skills
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">
            <span className="font-serif font-bold">Core expertise: </span>
            {skills.join(", ")}.
          </p>
        </section>
      )}

      {education.length > 0 && (
        <section aria-labelledby="ed-edu">
          <h2 id="ed-edu" className={h2}>
            Education
          </h2>
          <div className="mt-1 divide-y divide-stone-200">
            {education.map((e, i) => (
              <article key={i} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    {degreeLine(e)}
                  </h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    {formatEducationRange(e)}
                  </span>
                </div>
                <p className="mt-0.5 font-serif text-sm italic text-stone-600">
                  {e.institution}
                  {e.location ? `, ${e.location}` : ""}
                </p>
                {e.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                    {e.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section aria-labelledby="ed-certs">
          <h2 id="ed-certs" className={h2}>
            Certifications
          </h2>
          <ul className="mt-4 space-y-2.5">
            {certifications.map((c) => (
              <li
                key={c.name}
                className="flex flex-wrap items-baseline gap-x-3 text-sm"
              >
                <span className="font-serif font-bold text-stone-900">
                  {c.name}
                </span>
                <span className="text-stone-500">
                  {credentialMeta(c)}
                  {c.expires ? ` · expires ${c.expires}` : ""}
                </span>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 underline-offset-4 hover:underline"
                  >
                    <ArrowUpRight aria-hidden className="size-3" />
                    Credential
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section aria-labelledby="ed-langs">
          <h2 id="ed-langs" className={h2}>
            Languages
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">
            {languages.map(languageLine).join(" · ")}
          </p>
        </section>
      )}

      {resume?.hasResume && (
        <section aria-labelledby="ed-resume">
          <h2 id="ed-resume" className={h2}>
            Résumé
          </h2>
          <a
            href="#resume"
            className="mt-4 inline-flex items-center gap-2 font-serif text-base font-bold text-emerald-800 underline-offset-4 hover:underline"
          >
            <FileText aria-hidden className="size-4" />
            {resume.title ?? "View my professional résumé"}
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
        </section>
      )}
    </div>
  );
}
