import {
  BorderStyle,
  ExternalHyperlink,
  Paragraph,
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
/* Editorial Grid theme — rail/content table per entry: narrow left    */
/* cell carries the section label + dates; wide right cell carries the */
/* narrative. Calibri, stone palette, hairline row rules.              */
/* ------------------------------------------------------------------ */

export const EDITORIAL_GRID_THEME: DocxTheme = {
  font: "Calibri",
  body: "44403C", // stone-700
  muted: "78716C", // stone-500
  ink: "1C1917", // stone-900
  accent: "065F46", // emerald-800
  link: "065F46", // emerald-800
  size: { name: 42, headline: 20, heading: 18, body: 20 },
  spacing: { sectionGap: 0, headingAfter: 0, entryGap: 120, line: 50 },
  headingRuleSize: 2,
  summaryItalic: false,
};

const T = EDITORIAL_GRID_THEME;
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;

function railRun(text: string, opts?: { bold?: boolean }): TextRun {
  return new TextRun({
    text,
    font: T.font,
    size: T.size.heading,
    bold: opts?.bold,
    color: T.muted,
  });
}

function railLabel(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        bold: true,
        color: T.muted,
        characterSpacing: 40,
      }),
    ],
  });
}

function railDate(text: string): Paragraph {
  return new Paragraph({
    children: [railRun(text)],
    spacing: { before: 40 },
  });
}

/** One rail/content row. `first` draws the heavier hairline above. */
function railRow(
  rail: Paragraph[],
  content: Paragraph[],
  opts?: { first?: boolean },
): Table {
  const cellTop = opts?.first
    ? ({ style: BorderStyle.SINGLE, size: 4, color: "D6D3D1" } as const)
    : ({ style: BorderStyle.SINGLE, size: 2, color: "F5F5F4" } as const);
  return new Table({
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
            width: { size: 24, type: WidthType.PERCENTAGE },
            borders: { top: cellTop },
            children: rail,
          }),
          new TableCell({
            width: { size: 76, type: WidthType.PERCENTAGE },
            borders: { top: cellTop },
            children: content,
          }),
        ],
      }),
    ],
  });
}

function headerChildren(data: ResumeData): (Paragraph | Table)[] {
  const { basics } = data;
  const rail = [railLabel("Curriculum Vitae")];
  const content: Paragraph[] = [
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
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: basics.headline.toUpperCase(),
            font: T.font,
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
    parts.push(run(value, T, { color: T.muted, size: T.size.body }));
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
    content.push(new Paragraph({ children: parts, spacing: { before: 80 } }));
  }

  const header = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: "1C1917" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "D6D3D1" },
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 24, type: WidthType.PERCENTAGE },
            children: rail,
          }),
          new TableCell({
            width: { size: 76, type: WidthType.PERCENTAGE },
            children: content,
          }),
        ],
      }),
    ],
  });
  return [header];
}

function summarySection(data: ResumeData): (Paragraph | Table)[] {
  if (!data.summary) return [];
  return [
    railRow(
      [railLabel("Summary")],
      [new Paragraph({ children: multilineRuns(data.summary.text, T) })],
      { first: true },
    ),
  ];
}

function experienceSection(data: ResumeData): (Paragraph | Table)[] {
  return data.experience.map((w, i) =>
    railRow(
      [
        ...(i === 0 ? [railLabel("Experience")] : []),
        railDate(formatCareerDateRange(w.startDate, w.endDate, w.isCurrent)),
      ],
      [
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
              [w.company, w.location, w.employmentType]
                .filter(Boolean)
                .join(" · "),
              T,
              { color: T.muted },
            ),
          ],
          { keepNext: true },
        ),
        ...(w.summary
          ? [
              new Paragraph({
                children: multilineRuns(w.summary.text, T),
                spacing: { before: T.spacing.line },
              }),
            ]
          : []),
        ...w.highlights.map((h) => bullet(h.text, T)),
        new Paragraph({ spacing: { before: T.spacing.entryGap } }),
      ],
      { first: i === 0 },
    ),
  );
}

function educationSection(data: ResumeData): (Paragraph | Table)[] {
  return data.education.map((e, i) =>
    railRow(
      [
        ...(i === 0 ? [railLabel("Education")] : []),
        railDate(formatCareerDateRange(e.startDate, e.endDate)),
      ],
      [
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
        ...e.highlights.map((h) => bullet(h.text, T)),
        new Paragraph({ spacing: { before: T.spacing.entryGap } }),
      ],
      { first: i === 0 },
    ),
  );
}

function skillsSection(data: ResumeData): (Paragraph | Table)[] {
  if (data.skills.length === 0) return [];
  return [
    railRow(
      [railLabel("Skills")],
      data.skills.map(
        (g) =>
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
      ),
      { first: true },
    ),
  ];
}

function projectsSection(data: ResumeData): (Paragraph | Table)[] {
  return data.projects.map((p, i) =>
    railRow(
      [
        ...(i === 0 ? [railLabel("Projects")] : []),
        railDate(formatCareerDateRange(p.startDate, p.endDate)),
      ],
      [
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
        ...(p.url
          ? [
              new Paragraph({
                children: [hyperlink(p.url, p.url, T)],
                keepNext: true,
              }),
            ]
          : []),
        ...(p.description
          ? [
              new Paragraph({
                children: multilineRuns(p.description.text, T),
                spacing: { before: T.spacing.line },
              }),
            ]
          : []),
        ...p.highlights.map((h) => bullet(h.text, T)),
        new Paragraph({ spacing: { before: T.spacing.entryGap } }),
      ],
      { first: i === 0 },
    ),
  );
}

function certificationsSection(data: ResumeData): (Paragraph | Table)[] {
  return data.certifications.map((c, i) => {
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
    if (detail) children.push(run(` — ${detail}`, T, { color: T.muted }));
    if (c.url) {
      children.push(run(" ", T));
      children.push(hyperlink(c.url, c.url, T));
    }
    return railRow(
      [
        ...(i === 0 ? [railLabel("Certifications")] : []),
        railDate(formatCareerDateRange(c.date, c.expiryDate)),
      ],
      [
        new Paragraph({
          children,
          spacing: { before: T.spacing.line },
          keepLines: true,
        }),
      ],
      { first: i === 0 },
    );
  });
}

function languagesSection(data: ResumeData): (Paragraph | Table)[] {
  if (data.languages.length === 0) return [];
  return [
    railRow(
      [railLabel("Languages")],
      [
        new Paragraph({
          children: [
            run(
              data.languages
                .map(
                  (l) => `${l.language}${l.fluency ? ` — ${l.fluency}` : ""}`,
                )
                .join(" · "),
              T,
            ),
          ],
        }),
      ],
      { first: true },
    ),
  ];
}

const SECTION_BUILDERS: Record<
  ResumeSectionKey,
  (data: ResumeData) => (Paragraph | Table)[]
> = {
  summary: summarySection,
  experience: experienceSection,
  skills: skillsSection,
  education: educationSection,
  projects: projectsSection,
  certifications: certificationsSection,
  languages: languagesSection,
};

export function buildEditorialGridParagraphs(
  data: ResumeData,
): (Paragraph | Table)[] {
  return [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];
}
