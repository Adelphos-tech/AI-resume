import "server-only";

import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
  type ISectionOptions,
} from "docx";

import { formatCareerDateRange } from "@/lib/resume-format";
import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

const MAX_DOCX_BYTES = 10 * 1024 * 1024; // 10 MiB
const ZIP_SIGNATURE = Buffer.from("PK\x03\x04", "binary");

/* ------------------------------------------------------------------ */
/* ATS Classic typography — deliberate, centralized constants.         */
/* docx font sizes are half-points (20pt → 40).                        */
/* ------------------------------------------------------------------ */

const FONT = "Calibri";
const COLOR = "262626"; // charcoal
const MUTED = "525252";

const SIZE = {
  name: 40, // 20 pt
  headline: 22, // 11 pt
  heading: 21, // 10.5 pt
  body: 20, // 10 pt
} as const;

/* A4 portrait, ~16 mm vertical / ~15 mm horizontal margins (twips). */
const PAGE = {
  width: 11906,
  height: 16838,
  margin: { top: 907, bottom: 907, left: 850, right: 850 },
};
const CONTENT_WIDTH = PAGE.width - PAGE.margin.left - PAGE.margin.right;

const SPACING = {
  sectionGap: 240,
  headingAfter: 120,
  entryGap: 160,
  line: 60,
};

/* ------------------------------------------------------------------ */
/* Paragraph primitives                                                */
/* ------------------------------------------------------------------ */

function run(text: string, opts?: { bold?: boolean; color?: string }) {
  return new TextRun({
    text,
    font: FONT,
    size: SIZE.body,
    color: opts?.color ?? COLOR,
    bold: opts?.bold,
  });
}

/** Body text preserving authored line breaks as real line breaks. */
function multilineRuns(text: string): TextRun[] {
  return text.split("\n").map(
    (line, i) =>
      new TextRun({
        text: line,
        font: FONT,
        size: SIZE.body,
        color: COLOR,
        break: i > 0 ? 1 : 0,
      }),
  );
}

function hyperlink(url: string, label: string): ExternalHyperlink {
  return new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text: label,
        font: FONT,
        size: SIZE.body,
        color: MUTED,
        style: "hyperlink",
      }),
    ],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: FONT,
        size: SIZE.heading,
        bold: true,
        color: "171717",
      }),
    ],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "D4D4D4" },
    },
    spacing: { before: SPACING.sectionGap, after: SPACING.headingAfter },
    keepNext: true,
  });
}

/** Entry title row: bold title left, dates right via tab stop. */
function titleRow(title: string, dates: string): Paragraph {
  const children = [
    new TextRun({
      text: title,
      font: FONT,
      size: SIZE.body,
      bold: true,
      color: "171717",
    }),
  ];
  if (dates) {
    children.push(new TextRun({ text: "\t" }), run(dates, { color: MUTED }));
  }
  return new Paragraph({
    children,
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    keepNext: true,
  });
}

function bodyLine(
  children: (TextRun | ExternalHyperlink)[],
  opts?: { keepNext?: boolean; spacingBefore?: number },
): Paragraph {
  return new Paragraph({
    children,
    spacing: { before: opts?.spacingBefore ?? 0 },
    keepNext: opts?.keepNext,
    keepLines: true,
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: multilineRuns(text),
    bullet: { level: 0 },
    spacing: { before: SPACING.line },
    keepLines: true,
  });
}

/* ------------------------------------------------------------------ */
/* Header + sections — mirrors the ATS Classic React template          */
/* ------------------------------------------------------------------ */

function headerChildren(data: ResumeData): Paragraph[] {
  const { basics } = data;
  const out: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: basics.fullName.toUpperCase(),
          font: FONT,
          size: SIZE.name,
          bold: true,
          color: "0A0A0A",
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
            font: FONT,
            size: SIZE.headline,
            color: MUTED,
          }),
        ],
        keepNext: true,
      }),
    );
  }

  const parts: (TextRun | ExternalHyperlink)[] = [];
  const sep = () => parts.push(run(" · ", { color: MUTED }));
  const push = (value: string) => {
    if (parts.length > 0) sep();
    parts.push(run(value, { color: MUTED }));
  };
  if (basics.location) push(basics.location);
  if (basics.phone) push(basics.phone);
  if (basics.email) push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    if (parts.length > 0) sep();
    parts.push(hyperlink(link.url, link.label));
  }
  if (parts.length > 0) {
    out.push(new Paragraph({ children: parts, spacing: { before: 60 } }));
  }
  return out;
}

function summarySection(data: ResumeData): Paragraph[] {
  if (!data.summary) return [];
  return [
    sectionHeading("Professional Summary"),
    new Paragraph({ children: multilineRuns(data.summary.text) }),
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
      ),
    );
    const sub = [w.company, w.location, w.employmentType]
      .filter(Boolean)
      .join(" · ");
    out.push(bodyLine([run(sub, { color: MUTED })], { keepNext: true }));
    if (w.summary) {
      out.push(
        new Paragraph({
          children: multilineRuns(w.summary.text),
          spacing: { before: SPACING.line },
        }),
      );
    }
    w.highlights.forEach((h) => out.push(bullet(h.text)));
    out.push(new Paragraph({ spacing: { before: SPACING.entryGap } }));
  }
  out.pop(); // drop trailing spacer
  return out;
}

function educationSection(data: ResumeData): Paragraph[] {
  if (data.education.length === 0) return [];
  const out: Paragraph[] = [sectionHeading("Education")];
  for (const e of data.education) {
    const title =
      [e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || e.institution;
    out.push(titleRow(title, formatCareerDateRange(e.startDate, e.endDate)));
    const detail = [
      e.degree || e.fieldOfStudy ? e.institution : null,
      e.location,
    ]
      .filter(Boolean)
      .join(" · ");
    if (detail) {
      out.push(bodyLine([run(detail, { color: MUTED })], { keepNext: true }));
    }
    if (e.grade) {
      out.push(bodyLine([run(e.grade, { color: MUTED })], { keepNext: true }));
    }
    e.highlights.forEach((h) => out.push(bullet(h.text)));
    out.push(new Paragraph({ spacing: { before: SPACING.entryGap } }));
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
            text: `${g.name}: `,
            font: FONT,
            size: SIZE.body,
            bold: true,
            color: "171717",
          }),
          run(g.keywords.map((k) => k.text).join(", ")),
        ],
        spacing: { before: SPACING.line },
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
    out.push(titleRow(p.name, formatCareerDateRange(p.startDate, p.endDate)));
    if (p.url) {
      out.push(
        new Paragraph({ children: [hyperlink(p.url, p.url)], keepNext: true }),
      );
    }
    if (p.description) {
      out.push(
        new Paragraph({
          children: multilineRuns(p.description.text),
          spacing: { before: SPACING.line },
        }),
      );
    }
    p.highlights.forEach((h) => out.push(bullet(h.text)));
    out.push(new Paragraph({ spacing: { before: SPACING.entryGap } }));
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
        font: FONT,
        size: SIZE.body,
        color: "171717",
      }),
    ];
    if (detail) children.push(run(` — ${detail}`, { color: MUTED }));
    if (c.url) {
      children.push(run(" ", { color: MUTED }));
      children.push(hyperlink(c.url, c.url));
    }
    out.push(
      new Paragraph({
        children,
        spacing: { before: SPACING.line },
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

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

/**
 * Generate the ATS Classic DOCX for a frozen ResumeVariant.resumeData.
 * Consumes the same validated ResumeData and shared date formatter as
 * the React renderer — one content contract, two output formats.
 * Pure in-memory construction; writes nothing.
 */
export async function generateResumeDocx(input: {
  templateKey: string;
  resumeData: ResumeData;
}): Promise<Buffer> {
  if (input.templateKey !== "ats-classic") {
    throw new Error(`Unsupported resume template: ${input.templateKey}`);
  }
  const data = input.resumeData;

  const children = [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];

  const section: ISectionOptions = {
    properties: {
      page: {
        size: { width: PAGE.width, height: PAGE.height },
        margin: PAGE.margin,
      },
    },
    children,
  };

  const doc = new Document({
    sections: [section],
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE.body, color: COLOR },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  if (
    bytes.length === 0 ||
    bytes.length > MAX_DOCX_BYTES ||
    !bytes.subarray(0, 4).equals(ZIP_SIGNATURE)
  ) {
    throw new Error("Generated DOCX failed validation");
  }
  return bytes;
}
