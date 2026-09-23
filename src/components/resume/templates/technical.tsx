import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Technical — compact engineering-focused single-column resume.
 * Same ResumeData contract and block anchors as every template;
 * only presentation differs (zinc/graphite palette, monospace
 * section labels, denser spacing, emphasized skill groups).
 */

const INK = "text-zinc-900";
const BODY = "text-zinc-700";
const MUTED = "text-zinc-500";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-zinc-700 pb-1 font-mono text-[11px] font-semibold tracking-[0.18em] text-zinc-800 uppercase">
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
        className="text-zinc-700 underline decoration-zinc-400 underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <p className="font-mono text-[12px] leading-relaxed break-words text-zinc-600">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1 text-zinc-400">
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
        className="mt-2 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-700"
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
      <div className="mt-2.5 space-y-4">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-sm font-bold ${INK}`}>{w.position}</h3>
              <p className={`font-mono text-[12px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </p>
            </div>
            <p className={`text-[13px] font-medium ${BODY}`}>
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
            </p>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-600"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 marker:text-zinc-400">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-zinc-700"
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
      <div className="mt-2.5 space-y-3">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[13px] font-bold ${INK}`}>
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                  e.institution}
              </h3>
              <p className={`font-mono text-[12px] ${MUTED} tabular-nums`}>
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
                <p className={`text-[13px] ${BODY}`}>{detail}</p>
              ) : null;
            })()}
            {e.grade && <p className={`text-[13px] ${MUTED}`}>{e.grade}</p>}
            {e.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0.5 pl-5 marker:text-zinc-400">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-zinc-700"
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
            className="text-[13px] leading-relaxed break-words text-zinc-700"
          >
            <span className="font-mono font-semibold tracking-wide text-zinc-800 uppercase">
              {g.name}
            </span>
            <span className="text-zinc-400"> / </span>
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

function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;
  return (
    <section>
      <SectionHeading>Projects</SectionHeading>
      <div className="mt-2.5 space-y-3">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[13px] font-bold ${INK}`}>{p.name}</h3>
              <p className={`font-mono text-[12px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] break-all text-zinc-600 underline decoration-zinc-400 underline-offset-2"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-0.5 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-600"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0.5 pl-5 marker:text-zinc-400">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-zinc-700"
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
      <ul className="mt-2 space-y-1">
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
              className="text-[13px] leading-relaxed break-words text-zinc-700"
            >
              <span className="font-semibold text-zinc-800">{c.name}</span>
              {detail && <span className="text-zinc-600"> · {detail}</span>}
              {c.url && (
                <>
                  {" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-zinc-600 underline decoration-zinc-400 underline-offset-2"
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
      <p className="mt-2 text-[13px] leading-relaxed break-words text-zinc-700">
        {data.languages.map((l, i) => (
          <span key={l.sourceId}>
            {i > 0 && <span className="text-zinc-400"> · </span>}
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

export function TechnicalTemplate({ data }: { data: ResumeData }) {
  return (
    <article
      data-resume-document
      data-resume-template="technical"
      className="mx-auto w-full max-w-[46rem] bg-white px-8 py-8 font-sans text-zinc-800 sm:px-10 sm:py-10"
    >
      <header>
        <h1 className="text-[26px] leading-tight font-bold tracking-tight break-words text-zinc-900 uppercase">
          {data.basics.fullName}
        </h1>
        {data.basics.headline && (
          <p className="mt-0.5 text-sm font-semibold text-zinc-600">
            {data.basics.headline}
          </p>
        )}
        <div className="mt-2.5 border-t border-zinc-700 pt-1.5">
          <ContactLine basics={data.basics} />
        </div>
      </header>

      <div className="mt-5 space-y-5">
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
