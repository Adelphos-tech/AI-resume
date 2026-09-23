import { ExternalHyperlink, Paragraph, TabStopType, TextRun } from "docx";

/* ------------------------------------------------------------------ */
/* Shared DOCX primitives — every template builds from these so        */
/* output structure (paragraphs, bullets, hyperlinks, tab stops) is    */
/* identical; only theme constants differ.                              */
/* ------------------------------------------------------------------ */

export interface DocxTheme {
  font: string;
  /** Charcoal body color. */
  body: string;
  /** Secondary/muted text. */
  muted: string;
  /** Strongest ink (name, titles). */
  ink: string;
  /** Accent for rules/headings. */
  accent: string;
  /** Hyperlink run color. */
  link: string;
  /** Font sizes in half-points. */
  size: { name: number; headline: number; heading: number; body: number };
  /** Vertical spacing in twips. */
  spacing: {
    sectionGap: number;
    headingAfter: number;
    entryGap: number;
    line: number;
  };
  /** Heading bottom-rule size (eighths of a point). */
  headingRuleSize: number;
  /** Whether summary body text renders italic. */
  summaryItalic: boolean;
}

/* A4 portrait, ~16 mm vertical / ~15 mm horizontal margins (twips). */
export const PAGE = {
  width: 11906,
  height: 16838,
  margin: { top: 907, bottom: 907, left: 850, right: 850 },
};
export const CONTENT_WIDTH = PAGE.width - PAGE.margin.left - PAGE.margin.right;

export function run(
  text: string,
  t: DocxTheme,
  opts?: { bold?: boolean; color?: string; size?: number; italics?: boolean },
) {
  return new TextRun({
    text,
    font: t.font,
    size: opts?.size ?? t.size.body,
    color: opts?.color ?? t.body,
    bold: opts?.bold,
    italics: opts?.italics,
  });
}

/** Body text preserving authored line breaks as real line breaks. */
export function multilineRuns(
  text: string,
  t: DocxTheme,
  opts?: { italics?: boolean; color?: string },
): TextRun[] {
  return text.split("\n").map(
    (line, i) =>
      new TextRun({
        text: line,
        font: t.font,
        size: t.size.body,
        color: opts?.color ?? t.body,
        italics: opts?.italics,
        break: i > 0 ? 1 : 0,
      }),
  );
}

export function hyperlink(
  url: string,
  label: string,
  t: DocxTheme,
): ExternalHyperlink {
  return new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text: label,
        font: t.font,
        size: t.size.body,
        color: t.link,
        style: "hyperlink",
      }),
    ],
  });
}

/** Entry title row: bold title left, dates right via tab stop. */
export function titleRow(
  title: string,
  dates: string,
  t: DocxTheme,
  opts?: { size?: number },
): Paragraph {
  const children = [
    new TextRun({
      text: title,
      font: t.font,
      size: opts?.size ?? t.size.body,
      bold: true,
      color: t.ink,
    }),
  ];
  if (dates) {
    children.push(
      new TextRun({ text: "\t" }),
      run(dates, t, { color: t.muted }),
    );
  }
  return new Paragraph({
    children,
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    keepNext: true,
  });
}

export function bodyLine(
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

export function bullet(text: string, t: DocxTheme): Paragraph {
  return new Paragraph({
    children: multilineRuns(text, t),
    bullet: { level: 0 },
    spacing: { before: t.spacing.line },
    keepLines: true,
  });
}
