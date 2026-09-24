import {
  BorderStyle,
  ExternalHyperlink,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { formatCareerDateRange } from "@/lib/resume-format";
import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import {
  bodyLine,
  bullet,
  hyperlink,
  multilineRuns,
  run,
  type DocxTheme,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Modern Sidebar theme — coherent two-cell table: pale-stone sidebar  */
/* cell (contact/skills/certs/languages) + main cell (summary,         */
/* experience, education, projects). Cell contents stay contiguous so  */
/* extracted text never interleaves columns.                           */
/* ------------------------------------------------------------------ */

export const MODERN_SIDEBAR_THEME: DocxTheme = {
  font: "Calibri",
  body: "44403C", // stone-700
  muted: "78716C", // stone-500
  ink: "1C1917", // stone-900
  accent: "065F46", // emerald-800
  link: "065F46", // emerald-800
  size: { name: 36, headline: 21, heading: 18, body: 19 },
  spacing: { sectionGap: 160, headingAfter: 80, entryGap: 160, line: 40 },
  headingRuleSize: 2,
  summaryItalic: false,
};

const T = MODERN_SIDEBAR_THEME;
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;
const HAIRLINE = {
  style: BorderStyle.SINGLE,
  size: 2,
  color: "E7E5E4",
} as const;

function sideHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        bold: true,
        color: T.muted,
        characterSpacing: 28,
      }),
    ],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "D6D3D1" },
    },
    spacing: { before: T.spacing.sectionGap, after: T.spacing.headingAfter },
    keepNext: true,
  });
}

function mainHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        bold: true,
        color: T.accent,
        characterSpacing: 40,
      }),
    ],
    border: { bottom: HAIRLINE },
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
            text: basics.headline,
            font: T.font,
            size: T.size.headline,
            color: T.accent,
          }),
        ],
        keepNext: true,
      }),
    );
  }
  return out;
}

function contactBlock(data: ResumeData): Paragraph[] {
  const { basics } = data;
  const items: (TextRun | ExternalHyperlink)[] = [];
  for (const v of [basics.location, basics.phone, basics.email]) {
    if (v) items.push(run(v, T, { size: T.size.body }));
  }
  for (const link of basics.links) {
    if (link.url) items.push(hyperlink(link.url, link.label, T));
  }
  if (items.length === 0) return [];
  return [
    sideHeading("Contact"),
    ...items.map(
      (item) =>
        new Paragraph({
          children: [item],
          spacing: { before: T.spacing.line },
        }),
    ),
  ];
}

function sideSkills(data: ResumeData): Paragraph[] {
  if (data.skills.length === 0) return [];
  const out: Paragraph[] = [sideHeading("Skills")];
  for (const g of data.skills) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: g.name.toUpperCase(),
            font: T.font,
            size: T.size.body - 2,
            bold: true,
            color: T.body,
          }),
        ],
        spacing: { before: T.spacing.line },
        keepNext: true,
      }),
      new Paragraph({
        children: [run(g.keywords.map((k) => k.text).join(", "), T)],
        keepLines: true,
      }),
    );
  }
  return out;
}

function sideCertifications(data: ResumeData): Paragraph[] {
  if (data.certifications.length === 0) return [];
  const out: Paragraph[] = [sideHeading("Certifications")];
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
    if (detail) children.push(run(` · ${detail}`, T, { color: T.muted }));
    if (c.url) {
      children.push(run(" ", T));
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

function sideLanguages(data: ResumeData): Paragraph[] {
  if (data.languages.length === 0) return [];
  return [
    sideHeading("Languages"),
    ...data.languages.map(
      (l) =>
        new Paragraph({
          children: [
            run(`${l.language}${l.fluency ? ` — ${l.fluency}` : ""}`, T),
          ],
          spacing: { before: T.spacing.line },
        }),
    ),
  ];
}

const SIDE_BUILDERS: Partial<
  Record<ResumeSectionKey, (data: ResumeData) => Paragraph[]>
> = {
  skills: sideSkills,
  certifications: sideCertifications,
  languages: sideLanguages,
};

function summarySection(data: ResumeData): Paragraph[] {
  if (!data.summary) return [];
  return [
    mainHeading("Summary"),
    new Paragraph({ children: multilineRuns(data.summary.text, T) }),
  ];
}

function experienceSection(data: ResumeData): Paragraph[] {
  if (data.experience.length === 0) return [];
  const out: Paragraph[] = [mainHeading("Experience")];
  for (const w of data.experience) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: w.position,
            font: T.font,
            size: T.size.body + 1,
            bold: true,
            color: T.ink,
          }),
        ],
        keepNext: true,
      }),
      bodyLine(
        [
          run(
            [
              w.company,
              w.location,
              w.employmentType,
              formatCareerDateRange(w.startDate, w.endDate, w.isCurrent),
            ]
              .filter(Boolean)
              .join(" · "),
            T,
            { color: T.muted },
          ),
        ],
        { keepNext: true },
      ),
    );
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
  const out: Paragraph[] = [mainHeading("Education")];
  for (const e of data.education) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text:
              [e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
              e.institution,
            font: T.font,
            size: T.size.body,
            bold: true,
            color: T.ink,
          }),
        ],
        keepNext: true,
      }),
      bodyLine(
        [
          run(
            [
              e.degree || e.fieldOfStudy ? e.institution : null,
              e.location,
              formatCareerDateRange(e.startDate, e.endDate),
              e.grade,
            ]
              .filter(Boolean)
              .join(" · "),
            T,
            { color: T.muted },
          ),
        ],
        { keepNext: true },
      ),
    );
    e.highlights.forEach((h) => out.push(bullet(h.text, T)));
    out.push(new Paragraph({ spacing: { before: T.spacing.entryGap } }));
  }
  out.pop();
  return out;
}

function projectsSection(data: ResumeData): Paragraph[] {
  if (data.projects.length === 0) return [];
  const out: Paragraph[] = [mainHeading("Projects")];
  for (const p of data.projects) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: p.name,
            font: T.font,
            size: T.size.body,
            bold: true,
            color: T.ink,
          }),
        ],
        keepNext: true,
      }),
    );
    const meta = [p.url, formatCareerDateRange(p.startDate, p.endDate)]
      .filter(Boolean)
      .join(" · ");
    if (meta)
      out.push(
        bodyLine([run(meta, T, { color: T.muted })], { keepNext: true }),
      );
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

const MAIN_BUILDERS: Partial<
  Record<ResumeSectionKey, (data: ResumeData) => Paragraph[]>
> = {
  summary: summarySection,
  experience: experienceSection,
  education: educationSection,
  projects: projectsSection,
};

export function buildModernSidebarParagraphs(
  data: ResumeData,
): (Paragraph | Table)[] {
  const side = [...contactBlock(data)];
  const main: Paragraph[] = [];
  for (const key of data.sectionOrder) {
    const sideBuilder = SIDE_BUILDERS[key];
    if (sideBuilder) side.push(...sideBuilder(data));
    const mainBuilder = MAIN_BUILDERS[key];
    if (mainBuilder) main.push(...mainBuilder(data));
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: "FAFAF9", // stone-50
            },
            children: side.length > 0 ? side : [new Paragraph({})],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: main.length > 0 ? main : [new Paragraph({})],
          }),
        ],
      }),
    ],
  });

  return [...headerChildren(data), table];
}
