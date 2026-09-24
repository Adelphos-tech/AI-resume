import {
  BorderStyle,
  ExternalHyperlink,
  Paragraph,
  ShadingType,
  TextRun,
} from "docx";

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
/* Emerald Banner theme — shaded emerald header band (paragraph        */
/* shading, white text), clean Calibri body, emerald section labels.   */
/* Same content contract as every template.                            */
/* ------------------------------------------------------------------ */

export const EMERALD_BANNER_THEME: DocxTheme = {
  font: "Calibri",
  body: "44403C", // stone-700
  muted: "78716C", // stone-500
  ink: "1C1917", // stone-900
  accent: "065F46", // emerald-800
  link: "065F46", // emerald-800
  size: { name: 40, headline: 22, heading: 20, body: 20 },
  spacing: { sectionGap: 280, headingAfter: 120, entryGap: 200, line: 60 },
  headingRuleSize: 0,
  summaryItalic: false,
};

const T = EMERALD_BANNER_THEME;
const BANNER_FILL = "065F46";
const WHITE = "FFFFFF";

function bannerParagraph(
  children: (TextRun | ExternalHyperlink)[],
  spacing?: { before?: number; after?: number },
): Paragraph {
  return new Paragraph({
    children,
    shading: { type: ShadingType.CLEAR, color: "auto", fill: BANNER_FILL },
    spacing: { before: spacing?.before ?? 0, after: spacing?.after ?? 0 },
    keepNext: true,
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: T.font,
        size: T.size.heading,
        bold: true,
        color: T.ink,
        characterSpacing: 48,
      }),
    ],
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 4,
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
    bannerParagraph(
      [
        new TextRun({
          text: basics.fullName,
          font: T.font,
          size: T.size.name,
          bold: true,
          color: WHITE,
        }),
      ],
      { before: 160 },
    ),
  ];
  if (basics.headline) {
    out.push(
      bannerParagraph([
        new TextRun({
          text: basics.headline.toUpperCase(),
          font: T.font,
          size: T.size.headline - 2,
          color: "A7F3D0", // emerald-200
          characterSpacing: 16,
        }),
      ]),
    );
  }

  const parts: (TextRun | ExternalHyperlink)[] = [];
  const sep = () =>
    parts.push(
      new TextRun({
        text: " · ",
        font: T.font,
        size: T.size.body,
        color: "34D399", // emerald-400
      }),
    );
  const push = (value: string) => {
    if (parts.length > 0) sep();
    parts.push(
      new TextRun({
        text: value,
        font: T.font,
        size: T.size.body,
        color: "D1FAE5", // emerald-100
      }),
    );
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
            size: T.size.body,
            color: "D1FAE5",
            style: "hyperlink",
          }),
        ],
      }),
    );
  }
  if (parts.length > 0) {
    out.push(bannerParagraph(parts, { after: 160 }));
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
            text: g.name.toUpperCase(),
            font: T.font,
            size: T.size.body,
            bold: true,
            color: T.accent,
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

export function buildEmeraldBannerParagraphs(data: ResumeData): Paragraph[] {
  return [
    ...headerChildren(data),
    ...data.sectionOrder.flatMap((key) => SECTION_BUILDERS[key](data)),
  ];
}
