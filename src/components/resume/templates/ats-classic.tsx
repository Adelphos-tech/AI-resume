import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "../format";

/**
 * ATS Classic — single-column, restrained, text-first resume document.
 * Semantic HTML in DOM reading order; no tables, columns, or absolute
 * positioning so the content stays extractable by ATS/PDF tooling.
 */

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-neutral-300 pb-1 text-[11px] font-semibold tracking-[0.14em] text-neutral-900 uppercase">
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
        className="underline underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <p className="mt-1 text-sm leading-relaxed break-words text-neutral-700">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true">{" · "}</span>}
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
      <SectionHeading>Professional Summary</SectionHeading>
      <p
        data-resume-block-id={data.summary.id}
        className="mt-2 text-sm leading-relaxed whitespace-pre-wrap"
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
      <div className="mt-2 space-y-4">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                {w.position}
              </h3>
              <p className="text-sm text-neutral-600 tabular-nums">
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </p>
            </div>
            <p className="text-sm text-neutral-700">
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
            </p>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-1 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed"
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
      <div className="mt-2 space-y-1">
        {data.skills.map((g) => (
          <p
            key={g.sourceId}
            data-resume-source-id={g.sourceId}
            data-resume-block-id={g.blockId}
            className="text-sm leading-relaxed break-words"
          >
            <span className="font-semibold text-neutral-900">{g.name}: </span>
            {g.keywords.map((k, i) => (
              <span key={k.id}>
                {i > 0 && ", "}
                <span data-resume-block-id={k.id}>{k.text}</span>
              </span>
            ))}
          </p>
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
      <div className="mt-2 space-y-4">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                  e.institution}
              </h3>
              <p className="text-sm text-neutral-600 tabular-nums">
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
                <p className="text-sm text-neutral-700">{detail}</p>
              ) : null;
            })()}
            {e.grade && <p className="text-sm text-neutral-700">{e.grade}</p>}
            {e.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed"
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

function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;
  return (
    <section>
      <SectionHeading>Projects</SectionHeading>
      <div className="mt-2 space-y-4">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                {p.name}
              </h3>
              <p className="text-sm text-neutral-600 tabular-nums">
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm break-all text-neutral-700 underline underline-offset-2"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-1 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-sm leading-relaxed"
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
      <ul className="mt-2 space-y-1.5">
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
              className="text-sm leading-relaxed break-words"
            >
              <span className="font-medium text-neutral-900">{c.name}</span>
              {detail && <span className="text-neutral-700"> — {detail}</span>}
              {c.url && (
                <>
                  {" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-neutral-700 underline underline-offset-2"
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
      <p className="mt-2 text-sm leading-relaxed break-words">
        {data.languages.map((l, i) => (
          <span key={l.sourceId}>
            {i > 0 && " · "}
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

export function AtsClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <article
      data-resume-document
      data-resume-template="ats-classic"
      className="mx-auto w-full max-w-[48rem] bg-white px-8 py-10 font-sans text-neutral-800 sm:px-12 sm:py-14"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 uppercase">
          {data.basics.fullName}
        </h1>
        {data.basics.headline && (
          <p className="text-sm font-medium text-neutral-700">
            {data.basics.headline}
          </p>
        )}
        <ContactLine basics={data.basics} />
      </header>

      <div className="mt-6 space-y-6">
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
