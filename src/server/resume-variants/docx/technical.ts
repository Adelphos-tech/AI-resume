import { BorderStyle, Paragraph, TextRun, type ExternalHyperlink } from "docx";

import { formatCareerDateRange } from "@/lib/resume-format";
import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import {
  bodyLine,
  bullet,
  hyperlink,
  multilineRuns,
  run,
  titleRow,
  type DocxTheme,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Technical theme — Consolas accents, graphite zinc palette,          */
/* compact spacing. Same content contract as every template.           */
/* ------------------------------------------------------------------ */

export const TECHNICAL_THEME: DocxTheme = {
  font: "Calibri",
  body: "3F3F46", // zinc-700
  muted: "71717A", // zinc-500
  ink: "18181B", // zinc-900
  accent: "3F3F46", // zinc-700
  link: "52525B", // zinc-600
  size: { name: 36, headline: 20, heading: 20, body: 20 },
  spacing: { sectionGap: 200, headingAfter: 100, entryGap: 140, line: 50 },
  headingRuleSize: 6,
  summaryItalic: false,
};

const T = TECHNICAL_THEME;
const MONO = "Consolas";

function monoRun(
  text: string,
  opts?: { bold?: boolean; color?: string; size?: number },
): TextRun {
  return new TextRun({
    text,
    font: MONO,
    size: opts?.size ?? T.size.body - 2,
    bold: opts?.bold,
    color: opts?.color ?? T.muted,
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: MONO,
        size: T.size.heading,
        bold: true,
        color: T.accent,
        characterSpacing: 24,
      }),
    ],
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: T.headingRuleSize,
        color: T.accent,
      },
    },
    spacing: { before: T.spacing.sectionGap, after: T.spacing.headingAfter },
    keepNext: true,
  });
}

function headerChildren(data: ResumeData): Paragraph[] {
  const { basics } = data;
  const out: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: basics.fullName.toUpperCase(),
          font: T.font,
          size: T.size.name,
          bold: true,
          color: T.ink,
        }),
      ],
      keepNext: true,
    }),
  ];
  if (basics.headline) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: basics.headline,
            font: T.font,
            size: T.size.headline,
            bold: true,
            color: T.muted,
          }),
        ],
        keepNext: true,
      }),
    );
  }

  const parts: (TextRun | ExternalHyperlink)[] = [];
  const sep = () => parts.push(monoRun(" · ", { color: "D4D4D8" }));
  const push = (value: string) => {
    if (parts.length > 0) sep();
    parts.push(run(value, T, { color: T.link }));
  };
  if (basics.location) push(basics.location);
  if (basics.phone) push(basics.phone);
  if (basics.email) push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    if (parts.length > 0) sep();
    parts.push(hyperlink(link.url, link.label, T));
  }
  if (parts.length > 0) {
    out.push(
      new Paragraph({
        children: parts,
        spacing: { before: 60 },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: T.headingRuleSize,
            color: T.accent,
          },
        },
      }),
    );
  }
  return out;
}

function summarySection(data: ResumeData): Paragraph[] {
  if (!data.summary) return [];
  return [
    sectionHeading("Summary"),
    new Paragraph({ children: multilineRuns(data.summary.text, T) }),
  ];
}

function experienceSection(data: ResumeData): Paragraph[] {
  if (data.experience.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Experience")];
  for (const w of data.experience) {
    out.push(
      titleRow(
        w.position,
        formatCareerDateRange(w.startDate, w.endDate, w.isCurrent),
        T,
      ),
    );
    const sub = [w.company, w.location, w.employmentType]
      .filter(Boolean)
      .join(" · ");
    out.push(bodyLine([run(sub, T, { color: T.body })], { keepNext: true }));
    if (w.summary) {
      out.push(
        new Paragraph({
          children: multilineRuns(w.summary.text, T),
          spacing: { before: T.spacing.line },
        }),
      );
    }
    w.highlights.forEach((h) => out.push(bullet(h.text, T)));
    out.push(new Paragraph({ spacing: { before: T.spacing.entryGap } }));
  }
  out.pop();
  return out;
}

function educationSection(data: ResumeData): Paragraph[] {
  if (data.education.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Education")];
  for (const e of data.education) {
    const title =
      [e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || e.institution;
    out.push(titleRow(title, formatCareerDateRange(e.startDate, e.endDate), T));
    const detail = [
      e.degree || e.fieldOfStudy ? e.institution : null,
      e.location,
    ]
      .filter(Boolean)
      .join(" · ");
    if (detail) {
      out.push(
        bodyLine([run(detail, T, { color: T.body })], { keepNext: true }),
      );
    }
    if (e.grade) {
      out.push(
        bodyLine([run(e.grade, T, { color: T.muted })], { keepNext: true }),
      );
    }
    e.highlights.forEach((h) => out.push(bullet(h.text, T)));
    out.push(new Paragraph({ spacing: { before: T.spacing.entryGap } }));
  }
  out.pop();
  return out;
}

function skillsSection(data: ResumeData): Paragraph[] {
  if (data.skills.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Skills")];
  for (const g of data.skills) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: g.name.toUpperCase(),
            font: MONO,
            size: T.size.body - 2,
            bold: true,
            color: T.ink,
          }),
          monoRun(" / ", { color: "D4D4D8" }),
          run(g.keywords.map((k) => k.text).join(", "), T),
        ],
        spacing: { before: T.spacing.line },
        keepLines: true,
      }),
    );
  }
  return out;
}

function projectsSection(data: ResumeData): Paragraph[] {
  if (data.projects.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Projects")];
  for (const p of data.projects) {
    out.push(
      titleRow(p.name, formatCareerDateRange(p.startDate, p.endDate), T),
    );
    if (p.url) {
      out.push(
        new Paragraph({
          children: [hyperlink(p.url, p.url, T)],
          keepNext: true,
        }),
      );
    }
    if (p.description) {
      out.push(
        new Paragraph({
          children: multilineRuns(p.description.text, T),
          spacing: { before: T.spacing.line },
        }),
      );
    }
    p.highlights.forEach((h) => out.push(bullet(h.text, T)));
    out.push(new Paragraph({ spacing: { before: T.spacing.entryGap } }));
  }
  out.pop();
  return out;
}

function certificationsSection(data: ResumeData): Paragraph[] {
  if (data.certifications.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Certifications")];
  for (const c of data.certifications) {
    const detail = [
      c.issuer,
      formatCareerDateRange(c.date, c.expiryDate),
      c.credentialId ? `ID ${c.credentialId}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const children: (TextRun | ExternalHyperlink)[] = [
      new TextRun({
        text: c.name,
        font: T.font,
        size: T.size.body,
        bold: true,
        color: T.ink,
      }),
    ];
    if (detail) children.push(run(` · ${detail}`, T, { color: T.link }));
    if (c.url) {
      children.push(run(" ", T, { color: T.link }));
      children.push(hyperlink(c.url, c.url, T));
    }
    out.push(
      new Paragraph({
        children,
        spacing: { before: T.spacing.line },
        keepLines: true,
      }),
    );
  }
  return out;
}

function languagesSection(data: ResumeData): Paragraph[] {
  if (data.languages.length === 0) return [];
  return [
    sectionHeading("Languages"),
    new Paragraph({
      children: [
        run(
          data.languages
            .map((l) => `${l.language}${l.fluency ? ` — ${l.fluency}` : ""}`)
            .join(" · "),
          T,
        ),
      ],
    }),
  ];
}

const SECTION_BUILDERS: Record<
  ResumeSectionKey,
  (data: ResumeData) => Paragraph[]
> = {
  summary: summarySection,
  experience: experienceSection,
  skills: skillsSection,
  education: educationSection,
  projects: projectsSection,
  certifications: certificationsSection,
  languages: languagesSection,
};

export function buildTechnicalParagraphs(data: ResumeData): Paragraph[] {
  return [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];
}
