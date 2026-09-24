import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Editorial Grid — Swiss/editorial resume built on a strict two-column
 * grid: a narrow metadata rail (section labels, dates) and a wide
 * content column, separated by hairline rules. DOM order is linear —
 * rail label/dates read immediately before their entry — keeping text
 * extraction coherent. Same ResumeData contract and block anchors.
 */

const INK = "text-stone-900";
const BODY = "text-stone-700";
const MUTED = "text-stone-500";

function RailLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">
      {children}
    </p>
  );
}

function RailDate({ children }: { children: string }) {
  return <p className={`mt-1 text-[11px] ${MUTED} tabular-nums`}>{children}</p>;
}

/** One grid row: rail (label/dates) + content, hairline above. */
function Row({
  rail,
  children,
  first,
}: {
  rail: React.ReactNode;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[24%_1fr] gap-x-6 py-4 ${first ? "border-t border-stone-200" : "border-t border-stone-100"}`}
    >
      <div>{rail}</div>
      <div>{children}</div>
    </div>
  );
}

function SummarySection({ data }: { data: ResumeData }) {
  if (!data.summary) return null;
  return (
    <section>
      <Row rail={<RailLabel>Summary</RailLabel>} first>
        <p
          data-resume-block-id={data.summary.id}
          className="text-[13px] leading-relaxed whitespace-pre-wrap text-stone-700"
        >
          {data.summary.text}
        </p>
      </Row>
    </section>
  );
}

function ExperienceSection({ data }: { data: ResumeData }) {
  if (data.experience.length === 0) return null;
  return (
    <section>
      {data.experience.map((w, i) => (
        <Row
          key={w.sourceId}
          first={i === 0}
          rail={
            <>
              {i === 0 && <RailLabel>Experience</RailLabel>}
              <RailDate>
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </RailDate>
            </>
          }
        >
          <div
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <h3 className={`text-[14px] font-bold ${INK}`}>{w.position}</h3>
            <p className={`text-[12.5px] font-medium ${MUTED}`}>
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
            </p>
            {w.summary && (
              <p
                data-resume-block-id={w.summary.id}
                className="mt-1 text-[12.5px] leading-relaxed whitespace-pre-wrap text-stone-600"
              >
                {w.summary.text}
              </p>
            )}
            {w.highlights.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 marker:text-stone-400">
                {w.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12.5px] leading-relaxed text-stone-700"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Row>
      ))}
    </section>
  );
}

function EducationSection({ data }: { data: ResumeData }) {
  if (data.education.length === 0) return null;
  return (
    <section>
      {data.education.map((e, i) => (
        <Row
          key={e.sourceId}
          first={i === 0}
          rail={
            <>
              {i === 0 && <RailLabel>Education</RailLabel>}
              <RailDate>
                {formatCareerDateRange(e.startDate, e.endDate)}
              </RailDate>
            </>
          }
        >
          <div
            data-resume-source-id={e.sourceId}
            data-resume-block-id={e.blockId}
          >
            <h3 className={`text-[13px] font-bold ${INK}`}>
              {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                e.institution}
            </h3>
            <p className={`text-[12.5px] ${MUTED}`}>
              {[
                e.degree || e.fieldOfStudy ? e.institution : null,
                e.location,
                e.grade,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {e.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-stone-400">
                {e.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12.5px] leading-relaxed text-stone-700"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Row>
      ))}
    </section>
  );
}

function SkillsSection({ data }: { data: ResumeData }) {
  if (data.skills.length === 0) return null;
  return (
    <section>
      <Row rail={<RailLabel>Skills</RailLabel>} first>
        <div className="space-y-1.5">
          {data.skills.map((g) => (
            <p
              key={g.sourceId}
              data-resume-source-id={g.sourceId}
              data-resume-block-id={g.blockId}
              className="text-[12.5px] leading-relaxed break-words text-stone-700"
            >
              <span className="font-bold text-stone-900">{g.name}</span>
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
      </Row>
    </section>
  );
}

function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;
  return (
    <section>
      {data.projects.map((p, i) => (
        <Row
          key={p.sourceId}
          first={i === 0}
          rail={
            <>
              {i === 0 && <RailLabel>Projects</RailLabel>}
              <RailDate>
                {formatCareerDateRange(p.startDate, p.endDate)}
              </RailDate>
            </>
          }
        >
          <div
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <h3 className={`text-[13px] font-bold ${INK}`}>{p.name}</h3>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] break-all text-emerald-800 underline decoration-emerald-300 underline-offset-2"
              >
                {p.url}
              </a>
            )}
            {p.description && (
              <p
                data-resume-block-id={p.description.id}
                className="mt-0.5 text-[12.5px] leading-relaxed whitespace-pre-wrap text-stone-600"
              >
                {p.description.text}
              </p>
            )}
            {p.highlights.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-stone-400">
                {p.highlights.map((h) => (
                  <li
                    key={h.id}
                    data-resume-block-id={h.id}
                    className="text-[12.5px] leading-relaxed text-stone-700"
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Row>
      ))}
    </section>
  );
}

function CertificationsSection({ data }: { data: ResumeData }) {
  if (data.certifications.length === 0) return null;
  return (
    <section>
      {data.certifications.map((c, i) => (
        <Row
          key={c.sourceId}
          first={i === 0}
          rail={
            <>
              {i === 0 && <RailLabel>Certifications</RailLabel>}
              <RailDate>{formatCareerDateRange(c.date, c.expiryDate)}</RailDate>
            </>
          }
        >
          <p
            data-resume-source-id={c.sourceId}
            data-resume-block-id={c.blockId}
            className="text-[12.5px] leading-relaxed break-words text-stone-700"
          >
            <span className="font-semibold text-stone-900">{c.name}</span>
            {[c.issuer, c.credentialId ? `ID ${c.credentialId}` : null]
              .filter(Boolean)
              .map((d) => (
                <span key={d} className="text-stone-500">
                  {" "}
                  — {d}
                </span>
              ))}
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
          </p>
        </Row>
      ))}
    </section>
  );
}

function LanguagesSection({ data }: { data: ResumeData }) {
  if (data.languages.length === 0) return null;
  return (
    <section>
      <Row rail={<RailLabel>Languages</RailLabel>} first>
        <p className="text-[12.5px] leading-relaxed break-words text-stone-700">
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
      </Row>
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

export function EditorialGridTemplate({ data }: { data: ResumeData }) {
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
        className="break-all text-stone-600 underline decoration-stone-300 underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  return (
    <article
      data-resume-document
      data-resume-template="editorial-grid"
      className="mx-auto w-full max-w-[46rem] bg-white px-8 py-8 font-sans text-stone-800 sm:px-10 sm:py-10"
    >
      {/* Asymmetric header: meta label on the rail, identity on the grid. */}
      <header className="grid grid-cols-[24%_1fr] gap-x-6 border-t-2 border-stone-900 pt-5 pb-6">
        <div>
          <RailLabel>Curriculum Vitae</RailLabel>
        </div>
        <div>
          <h1 className="text-[30px] leading-tight font-bold tracking-tight text-stone-900">
            {basics.fullName}
          </h1>
          {basics.headline && (
            <p className="mt-1 text-[13px] font-medium tracking-[0.06em] text-emerald-800 uppercase">
              {basics.headline}
            </p>
          )}
          <p className="mt-2.5 text-[12px] leading-relaxed break-words text-stone-500">
            {contact.map((p, i) => (
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
        </div>
      </header>

      <div>
        {data.sectionOrder.map((key) => {
          const Section = SECTION_RENDERERS[key];
          return <Section key={key} data={data} />;
        })}
      </div>
    </article>
  );
}
