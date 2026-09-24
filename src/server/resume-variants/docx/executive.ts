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
/* Executive theme — Georgia display type, emerald accent, generous    */
/* spacing. Same content contract as every template.                   */
/* ------------------------------------------------------------------ */

export const EXECUTIVE_THEME: DocxTheme = {
  font: "Georgia",
  body: "44403C", // stone-700
  muted: "78716C", // stone-500
  ink: "1C1917", // stone-900
  accent: "065F46", // emerald-800
  link: "57534E", // stone-600
  size: { name: 44, headline: 22, heading: 20, body: 21 },
  spacing: { sectionGap: 320, headingAfter: 140, entryGap: 220, line: 70 },
  headingRuleSize: 4,
  summaryItalic: false,
};

const T = EXECUTIVE_THEME;

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        bold: false,
        color: T.accent,
        characterSpacing: 56,
      }),
    ],
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: T.headingRuleSize,
        color: "D6D3D1", // stone-300
      },
    },
    spacing: { before: T.spacing.sectionGap, after: T.spacing.headingAfter },
    keepNext: true,
  });
}

function headerChildren(data: ResumeData): Paragraph[] {
  const { basics } = data;
  const out: Paragraph[] = [
    // Emerald top accent rule.
    new Paragraph({
      children: [new TextRun({ text: " ", font: T.font, size: 4 })],
      border: {
        top: {
          style: BorderStyle.SINGLE,
          size: 18,
          color: T.accent,
        },
      },
      spacing: { after: 200 },
      keepNext: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: basics.fullName,
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
            text: basics.headline.toUpperCase(),
            font: "Calibri",
            size: T.size.headline,
            color: T.accent,
            characterSpacing: 16,
          }),
        ],
        spacing: { before: 40 },
        keepNext: true,
      }),
    );
  }

  const parts: (TextRun | ExternalHyperlink)[] = [];
  const sep = () => parts.push(run(" · ", T, { color: "D6D3D1" }));
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
        spacing: { before: 100 },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: 4,
            color: "D6D3D1",
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
        { size: T.size.body + 2 },
      ),
    );
    const sub = [w.company, w.location, w.employmentType]
      .filter(Boolean)
      .join(" · ");
    out.push(bodyLine([run(sub, T, { color: T.accent })], { keepNext: true }));
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
            text: g.name,
            font: T.font,
            size: T.size.body,
            bold: true,
            color: T.ink,
          }),
          run(" — ", T, { color: T.muted }),
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
    if (detail) children.push(run(` — ${detail}`, T, { color: T.link }));
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

export function buildExecutiveParagraphs(data: ResumeData): Paragraph[] {
  return [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];
}
