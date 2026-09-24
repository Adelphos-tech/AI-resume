import {
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";

import { formatCareerDateRange } from "@/lib/resume-format";
import type { ResumeData, ResumeSectionKey } from "@/lib/resume-schema";

import {
  bodyLine,
  bullet,
  CONTENT_WIDTH,
  hyperlink,
  multilineRuns,
  run,
  type DocxTheme,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Elegant Serif theme — Georgia throughout, centered header, hairline */
/* rules, airy spacing. Same content contract as every template.       */
/* ------------------------------------------------------------------ */

export const ELEGANT_SERIF_THEME: DocxTheme = {
  font: "Georgia",
  body: "44403C", // stone-700
  muted: "78716C", // stone-500
  ink: "1C1917", // stone-900
  accent: "57534E", // stone-600
  link: "57534E", // stone-600
  size: { name: 40, headline: 21, heading: 20, body: 21 },
  spacing: { sectionGap: 320, headingAfter: 160, entryGap: 240, line: 80 },
  headingRuleSize: 2,
  summaryItalic: false,
};

const T = ELEGANT_SERIF_THEME;
const RULE = "E7E5E4"; // stone-200 hairline

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        color: T.muted,
        characterSpacing: 60,
      }),
    ],
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: T.headingRuleSize,
        color: RULE,
      },
    },
    spacing: { before: T.spacing.sectionGap, after: T.spacing.headingAfter },
    keepNext: true,
  });
}

/** Title + right-aligned italic date row. */
function serifTitleRow(title: string, dates: string): Paragraph {
  const children = [
    new TextRun({
      text: title,
      font: T.font,
      size: T.size.body + 1,
      bold: true,
      color: T.ink,
    }),
  ];
  if (dates) {
    children.push(
      new TextRun({ text: "\t" }),
      new TextRun({
        text: dates,
        font: T.font,
        size: T.size.body - 2,
        italics: true,
        color: T.muted,
      }),
    );
  }
  return new Paragraph({
    children,
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
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
      alignment: AlignmentType.CENTER,
      keepNext: true,
    }),
  ];
  if (basics.headline) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: basics.headline.toUpperCase(),
            font: T.font,
            size: T.size.headline - 2,
            color: T.muted,
            characterSpacing: 16,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60 },
        keepNext: true,
      }),
    );
  }

  const parts: (TextRun | ExternalHyperlink)[] = [];
  const sep = () => parts.push(run(" · ", T, { color: "D6D3D1" }));
  const push = (value: string) => {
    if (parts.length > 0) sep();
    parts.push(run(value, T, { color: T.muted, size: T.size.headline }));
  };
  if (basics.location) push(basics.location);
  if (basics.phone) push(basics.phone);
  if (basics.email) push(basics.email);
  for (const link of basics.links) {
    if (!link.url) continue;
    if (parts.length > 0) sep();
    parts.push(
      new ExternalHyperlink({
        link: link.url,
        children: [
          new TextRun({
            text: link.label,
            font: T.font,
            size: T.size.headline,
            color: T.link,
            style: "hyperlink",
          }),
        ],
      }),
    );
  }
  if (parts.length > 0) {
    out.push(
      new Paragraph({
        children: parts,
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: T.headingRuleSize,
            color: RULE,
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
      serifTitleRow(
        w.position,
        formatCareerDateRange(w.startDate, w.endDate, w.isCurrent),
      ),
    );
    const sub = [w.company, w.location, w.employmentType]
      .filter(Boolean)
      .join(" · ");
    out.push(bodyLine([run(sub, T)], { keepNext: true }));
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
    out.push(
      serifTitleRow(title, formatCareerDateRange(e.startDate, e.endDate)),
    );
    const detail = [
      e.degree || e.fieldOfStudy ? e.institution : null,
      e.location,
      e.grade,
    ]
      .filter(Boolean)
      .join(" · ");
    if (detail) {
      out.push(bodyLine([run(detail, T)], { keepNext: true }));
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
            italics: true,
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
      serifTitleRow(p.name, formatCareerDateRange(p.startDate, p.endDate)),
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
    if (detail) children.push(run(` — ${detail}`, T, { color: T.muted }));
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

export function buildElegantSerifParagraphs(data: ResumeData): Paragraph[] {
  return [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];
}
