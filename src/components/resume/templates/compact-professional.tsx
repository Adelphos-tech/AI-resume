import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Compact Professional — the most information-dense RoleRace template.
 * Same ResumeData contract and block anchors as every template; only
 * presentation differs (tight rhythm, small uppercase headings, thin
 * full-width rules, right-aligned dates, near-zero decoration).
 */

const INK = "text-stone-900";
const MUTED = "text-stone-500";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-stone-400 pb-0.5 text-[10px] font-bold tracking-[0.2em] text-stone-700 uppercase">
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
        className="text-stone-700 underline decoration-stone-400 underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <p className="text-[11px] leading-snug break-words text-stone-600">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1 text-stone-400">
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
        className="mt-1 text-[12px] leading-snug whitespace-pre-wrap text-stone-700"
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
      <div className="mt-1.5 space-y-2.5">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[12.5px] font-bold ${INK}`}>
                {w.position}
                <span className={`font-medium ${MUTED}`}>
                  {`, ${w.company}`}
                  {w.location ? ` · ${w.location}` : ""}
                  {w.employmentType ? ` · ${w.employmentType}` : ""}
                </span>
              </h3>
              <p className={`text-[11px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </p>
            </div>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-0.5 text-[12px] leading-snug whitespace-pre-wrap text-stone-600"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0 pl-4 marker:text-stone-400">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12px] leading-snug text-stone-700"
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
      <div className="mt-1.5 space-y-2">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[12px] font-bold ${INK}`}>
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                  e.institution}
                <span className={`font-medium ${MUTED}`}>
                  {e.degree || e.fieldOfStudy ? `, ${e.institution}` : ""}
                </span>
              </h3>
              <p className={`text-[11px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(e.startDate, e.endDate)}
              </p>
            </div>
            {(() => {
              const detail = [e.location, e.grade].filter(Boolean).join(" · ");
              return detail ? (
                <p className={`text-[12px] ${MUTED}`}>{detail}</p>
              ) : null;
            })()}
            {e.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0 pl-4 marker:text-stone-400">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12px] leading-snug text-stone-700"
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
      <div className="mt-1 space-y-0.5">
        {data.skills.map((g) => (
          <p
            key={g.sourceId}
            data-resume-source-id={g.sourceId}
            data-resume-block-id={g.blockId}
            className="text-[12px] leading-snug break-words text-stone-700"
          >
            <span className="font-bold text-stone-800">{g.name}</span>
            <span className="text-stone-400">: </span>
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
      <div className="mt-1.5 space-y-2">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[12px] font-bold ${INK}`}>{p.name}</h3>
              <p className={`text-[11px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] break-all text-stone-600 underline decoration-stone-400 underline-offset-2"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-0.5 text-[12px] leading-snug whitespace-pre-wrap text-stone-600"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0 pl-4 marker:text-stone-400">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12px] leading-snug text-stone-700"
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
      <ul className="mt-1 space-y-0.5">
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
              className="text-[12px] leading-snug break-words text-stone-700"
            >
              <span className="font-semibold text-stone-800">{c.name}</span>
              {detail && <span className="text-stone-600"> · {detail}</span>}
              {c.url && (
                <>
                  {" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-stone-600 underline decoration-stone-400 underline-offset-2"
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
      <p className="mt-1 text-[12px] leading-snug break-words text-stone-700">
        {data.languages.map((l, i) => (
          <span key={l.sourceId}>
            {i > 0 && <span className="text-stone-400"> · </span>}
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

export function CompactProfessionalTemplate({ data }: { data: ResumeData }) {
  return (
    <article
      data-resume-document
      data-resume-template="compact-professional"
      className="mx-auto w-full max-w-[46rem] bg-white px-8 py-7 font-sans text-stone-800 sm:px-9 sm:py-8"
    >
      <header>
        <h1 className="text-[22px] leading-tight font-bold tracking-tight text-stone-900 uppercase">
          {data.basics.fullName}
        </h1>
        {data.basics.headline && (
          <p className="mt-0.5 text-[12px] font-semibold text-stone-600">
            {data.basics.headline}
          </p>
        )}
        <div className="mt-1.5 border-t border-stone-400 pt-1">
          <ContactLine basics={data.basics} />
        </div>
      </header>

      <div className="mt-3.5 space-y-3.5">
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
