import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Emerald Banner — branded single-column resume with a strong emerald
 * header band. Same ResumeData contract and block anchors as every
 * template; only presentation differs (deep-emerald banner containing
 * name/headline/contact, clean sans body below).
 */

const INK = "text-stone-900";
const BODY = "text-stone-700";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="flex items-baseline gap-3 text-[11px] font-bold tracking-[0.24em] text-stone-800 uppercase">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-stone-200" />
    </h2>
  );
}

function ExperienceSection({ data }: { data: ResumeData }) {
  if (data.experience.length === 0) return null;
  return (
    <section>
      <SectionHeading>Experience</SectionHeading>
      <div className="mt-3.5 space-y-5">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[14.5px] font-bold ${INK}`}>{w.position}</h3>
              <p
                className={`rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 tabular-nums`}
              >
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </p>
            </div>
            <p className={`text-[13px] font-semibold text-emerald-800`}>
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
            </p>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-stone-600"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 marker:text-emerald-700">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-stone-700"
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

function SummarySection({ data }: { data: ResumeData }) {
  if (!data.summary) return null;
  return (
    <section>
      <SectionHeading>Summary</SectionHeading>
      <p
        data-resume-block-id={data.summary.id}
        className="mt-3 text-[13.5px] leading-relaxed whitespace-pre-wrap text-stone-700"
      >
        {data.summary.text}
      </p>
    </section>
  );
}

function EducationSection({ data }: { data: ResumeData }) {
  if (data.education.length === 0) return null;
  return (
    <section>
      <SectionHeading>Education</SectionHeading>
      <div className="mt-3.5 space-y-4">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[13.5px] font-bold ${INK}`}>
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                  e.institution}
              </h3>
              <p
                className={`rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 tabular-nums`}
              >
                {formatCareerDateRange(e.startDate, e.endDate)}
              </p>
            </div>
            {(() => {
              const detail = [
                e.degree || e.fieldOfStudy ? e.institution : null,
                e.location,
                e.grade,
              ]
                .filter(Boolean)
                .join(" · ");
              return detail ? (
                <p className={`text-[13px] ${BODY}`}>{detail}</p>
              ) : null;
            })()}
            {e.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 marker:text-emerald-700">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-stone-700"
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
      <div className="mt-3 space-y-1.5">
        {data.skills.map((g) => (
          <p
            key={g.sourceId}
            data-resume-source-id={g.sourceId}
            data-resume-block-id={g.blockId}
            className="text-[13px] leading-relaxed break-words text-stone-700"
          >
            <span className="font-bold tracking-wide text-emerald-800 uppercase">
              {g.name}
            </span>
            <span className="text-stone-400"> — </span>
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
      <div className="mt-3.5 space-y-4">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[13.5px] font-bold ${INK}`}>{p.name}</h3>
              <p
                className={`rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 tabular-nums`}
              >
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] break-all text-emerald-800 underline decoration-emerald-300 underline-offset-2"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-stone-600"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 marker:text-emerald-700">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[13px] leading-relaxed text-stone-700"
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
      <ul className="mt-3 space-y-1.5">
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
              className="text-[13px] leading-relaxed break-words text-stone-700"
            >
              <span className="font-semibold text-stone-800">{c.name}</span>
              {detail && <span className="text-stone-500"> — {detail}</span>}
              {c.url && (
                <>
                  {" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-emerald-800 underline decoration-emerald-300 underline-offset-2"
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
      <p className="mt-3 text-[13px] leading-relaxed break-words text-stone-700">
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

export function EmeraldBannerTemplate({ data }: { data: ResumeData }) {
  const { basics } = data;
  const contact: React.ReactNode[] = [];
  if (basics.location) contact.push(basics.location);
  if (basics.phone) contact.push(basics.phone);
  if (basics.email) contact.push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    contact.push(
      <a
        key={link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-100 underline decoration-emerald-500 underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <article
      data-resume-document
      data-resume-template="emerald-banner"
      className="mx-auto w-full max-w-[46rem] bg-white font-sans text-stone-800"
    >
      <header className="bg-emerald-800 px-10 py-8 text-emerald-50 sm:px-12">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight text-white">
          {basics.fullName}
        </h1>
        {basics.headline && (
          <p className="mt-1 text-[13px] font-medium tracking-[0.08em] text-emerald-200 uppercase">
            {basics.headline}
          </p>
        )}
        <p className="mt-3 border-t border-emerald-700 pt-3 text-[12.5px] leading-relaxed break-words text-emerald-100">
          {contact.map((p, i) => (
            <span key={i}>
              {i > 0 && (
                <span aria-hidden="true" className="px-1.5 text-emerald-500">
                  ·
                </span>
              )}
              {p}
            </span>
          ))}
        </p>
      </header>

      <div className="space-y-7 px-10 py-8 sm:px-12">
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
