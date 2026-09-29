import { ArrowUpRight } from "lucide-react";
import type {
  DemoExperience,
  DemoProject,
} from "@/components/career-card/dev/demo-career-profile";
import { formatRange } from "@/components/career-card/modules/experience-content";

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
}: {
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
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
    </div>
  );
}
