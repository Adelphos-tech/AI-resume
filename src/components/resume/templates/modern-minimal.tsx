import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Modern Minimal — whitespace-driven contemporary single-column resume.
 * Same ResumeData contract and block anchors as every template; only
 * presentation differs (stone palette, airy spacing, light rules,
 * mixed-case name, muted letterspaced section labels).
 */

const INK = "text-stone-800";
const BODY = "text-stone-600";
const MUTED = "text-stone-400";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-[10.5px] font-medium tracking-[0.3em] text-stone-400 uppercase">
      {children}
    </h2>
  );
}

function ContactLine({ basics }: { basics: ResumeData["basics"] }) {
  const parts: React.ReactNode[] = [];
  if (basics.location) parts.push(basics.location);
  if (basics.phone) parts.push(basics.phone);
  if (basics.email) parts.push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    parts.push(
      <a
        key={link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-600 underline decoration-stone-300 underline-offset-4"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <p className="text-[13px] leading-relaxed break-words text-stone-500">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1.5 text-stone-300">
              ·
            </span>
          )}
          {p}
        </span>
      ))}
    </p>
  );
}

function SummarySection({ data }: { data: ResumeData }) {
  if (!data.summary) return null;
  return (
    <section>
      <SectionHeading>Summary</SectionHeading>
      <p
        data-resume-block-id={data.summary.id}
        className="mt-3.5 text-sm leading-loose whitespace-pre-wrap text-stone-600"
      >
        {data.summary.text}
      </p>
    </section>
  );
}

function ExperienceSection({ data }: { data: ResumeData }) {
  if (data.experience.length === 0) return null;
  return (
    <section>
      <SectionHeading>Experience</SectionHeading>
      <div className="mt-4 space-y-7">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[15px] font-semibold tracking-tight ${INK}`}>
                {w.position}
              </h3>
              <p className={`text-[12.5px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </p>
            </div>
            <p className={`mt-0.5 text-sm ${BODY}`}>
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
            </p>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-stone-500"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-stone-300">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed text-stone-600"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationSection({ data }: { data: ResumeData }) {
  if (data.education.length === 0) return null;
  return (
    <section>
      <SectionHeading>Education</SectionHeading>
      <div className="mt-4 space-y-5">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-sm font-semibold ${INK}`}>
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                  e.institution}
              </h3>
              <p className={`text-[12.5px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(e.startDate, e.endDate)}
              </p>
            </div>
            {(() => {
              const detail = [
                e.degree || e.fieldOfStudy ? e.institution : null,
                e.location,
              ]
                .filter(Boolean)
                .join(" · ");
              return detail ? (
                <p className={`mt-0.5 text-sm ${BODY}`}>{detail}</p>
              ) : null;
            })()}
            {e.grade && <p className={`mt-0.5 text-sm ${MUTED}`}>{e.grade}</p>}
            {e.highlights.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-stone-300">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed text-stone-600"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsSection({ data }: { data: ResumeData }) {
  if (data.skills.length === 0) return null;
  return (
    <section>
      <SectionHeading>Skills</SectionHeading>
      <div className="mt-4 space-y-2">
        {data.skills.map((g) => (
          <div
            key={g.sourceId}
            data-resume-source-id={g.sourceId}
            data-resume-block-id={g.blockId}
            className="text-sm leading-relaxed break-words"
          >
            <span className="font-medium tracking-wide text-stone-700">
              {g.name}
            </span>
            <p className="text-stone-500">
              {g.keywords.map((k, i) => (
                <span key={k.id}>
                  {i > 0 && <span className="text-stone-300"> · </span>}
                  <span data-resume-block-id={k.id}>{k.text}</span>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;
  return (
    <section>
      <SectionHeading>Projects</SectionHeading>
      <div className="mt-4 space-y-5">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-sm font-semibold ${INK}`}>{p.name}</h3>
              <p className={`text-[12.5px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] break-all text-stone-500 underline decoration-stone-300 underline-offset-4"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-stone-500"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-stone-300">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed text-stone-600"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificationsSection({ data }: { data: ResumeData }) {
  if (data.certifications.length === 0) return null;
  return (
    <section>
      <SectionHeading>Certifications</SectionHeading>
      <ul className="mt-4 space-y-1.5">
        {data.certifications.map((c) => {
          const detail = [
            c.issuer,
            formatCareerDateRange(c.date, c.expiryDate),
            c.credentialId ? `ID ${c.credentialId}` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li
              key={c.sourceId}
              data-resume-source-id={c.sourceId}
              data-resume-block-id={c.blockId}
              className="text-sm leading-relaxed break-words text-stone-600"
            >
              <span className="font-medium text-stone-700">{c.name}</span>
              {detail && <span className="text-stone-500"> · {detail}</span>}
              {c.url && (
                <>
                  {" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-stone-500 underline decoration-stone-300 underline-offset-4"
                  >
                    {c.url}
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LanguagesSection({ data }: { data: ResumeData }) {
  if (data.languages.length === 0) return null;
  return (
    <section>
      <SectionHeading>Languages</SectionHeading>
      <p className="mt-4 text-sm leading-relaxed break-words text-stone-600">
        {data.languages.map((l, i) => (
          <span key={l.sourceId}>
            {i > 0 && <span className="text-stone-300"> · </span>}
            <span
              data-resume-source-id={l.sourceId}
              data-resume-block-id={l.blockId}
            >
              {l.language}
              {l.fluency ? ` — ${l.fluency}` : ""}
            </span>
          </span>
        ))}
      </p>
    </section>
  );
}

const SECTION_RENDERERS: Record<
  ResumeSectionKey,
  (props: { data: ResumeData }) => React.ReactNode
> = {
  summary: SummarySection,
  experience: ExperienceSection,
  skills: SkillsSection,
  education: EducationSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  languages: LanguagesSection,
};

export function ModernMinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <article
      data-resume-document
      data-resume-template="modern-minimal"
      className="mx-auto w-full max-w-[46rem] bg-white px-10 py-12 font-sans text-stone-600 sm:px-14 sm:py-16"
    >
      <header>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight break-words text-stone-900">
          {data.basics.fullName}
        </h1>
        {data.basics.headline && (
          <p className="mt-1.5 text-sm text-stone-500">
            {data.basics.headline}
          </p>
        )}
        <div className="mt-4 border-t border-stone-200 pt-3">
          <ContactLine basics={data.basics} />
        </div>
      </header>

      <div className="mt-9 space-y-9">
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
