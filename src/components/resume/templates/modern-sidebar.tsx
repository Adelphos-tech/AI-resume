import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import { formatCareerDateRange } from "@/lib/resume-format";

/**
 * Modern Sidebar — light two-column resume. Header spans the page;
 * the pale-stone sidebar carries contact, skills, languages, and
 * certifications while the main column carries the narrative content.
 * DOM order is header → sidebar → main so extraction stays coherent.
 * Same ResumeData contract and block anchors as every template.
 */

const INK = "text-stone-900";
const BODY = "text-stone-700";
const MUTED = "text-stone-500";

const SIDEBAR_SECTIONS = new Set<ResumeSectionKey>([
  "skills",
  "languages",
  "certifications",
]);

function MainHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-stone-200 pb-1.5 text-[11px] font-bold tracking-[0.22em] text-emerald-800 uppercase">
      {children}
    </h2>
  );
}

function SideHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-stone-300 pb-1 text-[10px] font-bold tracking-[0.18em] text-stone-600 uppercase">
      {children}
    </h2>
  );
}

function ContactSection({ basics }: { basics: ResumeData["basics"] }) {
  const items: React.ReactNode[] = [];
  if (basics.location) items.push(basics.location);
  if (basics.phone) items.push(basics.phone);
  if (basics.email) items.push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    items.push(
      <a
        key={link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-emerald-800 underline decoration-emerald-300 underline-offset-2"
      >
        {link.label}
      </a>,
    );
  }
  if (items.length === 0) return null;
  return (
    <section>
      <SideHeading>Contact</SideHeading>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-[11.5px] leading-snug break-words text-stone-600"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SkillsSection({ data }: { data: ResumeData }) {
  if (data.skills.length === 0) return null;
  return (
    <section>
      <SideHeading>Skills</SideHeading>
      <div className="mt-2 space-y-2">
        {data.skills.map((g) => (
          <div
            key={g.sourceId}
            data-resume-source-id={g.sourceId}
            data-resume-block-id={g.blockId}
          >
            <p className="text-[11px] font-bold tracking-wide text-stone-700 uppercase">
              {g.name}
            </p>
            <p className="text-[11.5px] leading-snug break-words text-stone-600">
              {g.keywords.map((k, i) => (
                <span key={k.id}>
                  {i > 0 && ", "}
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

function CertificationsSection({ data }: { data: ResumeData }) {
  if (data.certifications.length === 0) return null;
  return (
    <section>
      <SideHeading>Certifications</SideHeading>
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
              className="text-[11.5px] leading-snug break-words text-stone-600"
            >
              <span className="font-semibold text-stone-800">{c.name}</span>
              {detail && <span> · {detail}</span>}
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
      <SideHeading>Languages</SideHeading>
      <ul className="mt-2 space-y-1">
        {data.languages.map((l) => (
          <li
            key={l.sourceId}
            data-resume-source-id={l.sourceId}
            data-resume-block-id={l.blockId}
            className="text-[11.5px] leading-snug text-stone-600"
          >
            {l.language}
            {l.fluency ? ` — ${l.fluency}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SummarySection({ data }: { data: ResumeData }) {
  if (!data.summary) return null;
  return (
    <section>
      <MainHeading>Summary</MainHeading>
      <p
        data-resume-block-id={data.summary.id}
        className="mt-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-stone-700"
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
      <MainHeading>Experience</MainHeading>
      <div className="mt-3 space-y-5">
        {data.experience.map((w) => (
          <div
            key={w.sourceId}
            data-resume-source-id={w.sourceId}
            data-resume-block-id={w.blockId}
          >
            <h3 className={`text-[14px] font-bold ${INK}`}>{w.position}</h3>
            <p className={`text-[12.5px] font-medium ${MUTED}`}>
              {w.company}
              {w.location ? ` · ${w.location}` : ""}
              {w.employmentType ? ` · ${w.employmentType}` : ""}
              {" · "}
              <span className="tabular-nums">
                {formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)}
              </span>
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
              <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-emerald-700">
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
        ))}
      </div>
    </section>
  );
}

function EducationSection({ data }: { data: ResumeData }) {
  if (data.education.length === 0) return null;
  return (
    <section>
      <MainHeading>Education</MainHeading>
      <div className="mt-3 space-y-3.5">
        {data.education.map((e) => (
          <div
            key={e.sourceId}
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
                formatCareerDateRange(e.startDate, e.endDate),
                e.grade,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {e.highlights.length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4 marker:text-emerald-700">
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
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;
  return (
    <section>
      <MainHeading>Projects</MainHeading>
      <div className="mt-3 space-y-3.5">
        {data.projects.map((p) => (
          <div
            key={p.sourceId}
            data-resume-source-id={p.sourceId}
            data-resume-block-id={p.blockId}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className={`text-[13px] font-bold ${INK}`}>{p.name}</h3>
              <p className={`text-[11.5px] ${MUTED} tabular-nums`}>
                {formatCareerDateRange(p.startDate, p.endDate)}
              </p>
            </div>
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
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4 marker:text-emerald-700">
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
        ))}
      </div>
    </section>
  );
}

const MAIN_RENDERERS: Partial<
  Record<ResumeSectionKey, (props: { data: ResumeData }) => React.ReactNode>
> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
};

const SIDE_RENDERERS: Partial<
  Record<ResumeSectionKey, (props: { data: ResumeData }) => React.ReactNode>
> = {
  skills: SkillsSection,
  certifications: CertificationsSection,
  languages: LanguagesSection,
};

export function ModernSidebarTemplate({ data }: { data: ResumeData }) {
  const sideSections = data.sectionOrder.filter((k) => SIDEBAR_SECTIONS.has(k));
  const mainSections = data.sectionOrder.filter(
    (k) => !SIDEBAR_SECTIONS.has(k),
  );
  return (
    <article
      data-resume-document
      data-resume-template="modern-sidebar"
      className="mx-auto w-full max-w-[46rem] bg-white font-sans text-stone-800"
    >
      <header className="px-8 pt-8 pb-5 sm:px-9">
        <h1 className="text-[26px] leading-tight font-bold tracking-tight text-stone-900">
          {data.basics.fullName}
        </h1>
        {data.basics.headline && (
          <p className="mt-0.5 text-[13px] font-medium tracking-wide text-emerald-800">
            {data.basics.headline}
          </p>
        )}
      </header>

      {/* DOM order: sidebar first, then main — both are coherent groups
          for text extraction; grid places them visually side by side. */}
      <div className="grid grid-cols-[30%_1fr]">
        <div className="space-y-5 border-r border-stone-200 bg-stone-50/70 px-5 py-6">
          <ContactSection basics={data.basics} />
          {sideSections.map((key) => {
            const Section = SIDE_RENDERERS[key];
            return Section ? <Section key={key} data={data} /> : null;
          })}
        </div>
        <div className="space-y-6 px-6 py-6 sm:px-7">
          {mainSections.map((key) => {
            const Section = MAIN_RENDERERS[key];
            return Section ? <Section key={key} data={data} /> : null;
          })}
        </div>
      </div>
    </article>
  );
}
