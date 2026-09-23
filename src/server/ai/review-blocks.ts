import type { ResumeData } from "@/lib/resume-schema";
import type { AiResumeReview } from "@/server/ai/resume-review-schema";

export type ReviewBlock = {
  blockId: string;
  section: string;
  text: string;
};

/**
 * Flattens ResumeData into the compact review payload. Anchors are the
 * existing canonical text-block IDs — no parallel ID system is created.
 */
export function buildReviewBlocks(data: ResumeData): ReviewBlock[] {
  const blocks: ReviewBlock[] = [];

  if (data.summary) {
    blocks.push({
      blockId: data.summary.id,
      section: "summary",
      text: data.summary.text,
    });
  }
  for (const w of data.experience) {
    const ctx = `${w.position} at ${w.company}`;
    if (w.summary) {
      blocks.push({
        blockId: w.summary.id,
        section: `experience: ${ctx}`,
        text: w.summary.text,
      });
    }
    for (const h of w.highlights) {
      blocks.push({
        blockId: h.id,
        section: `experience: ${ctx}`,
        text: h.text,
      });
    }
  }
  for (const e of data.education) {
    for (const h of e.highlights) {
      blocks.push({
        blockId: h.id,
        section: `education: ${e.institution}`,
        text: h.text,
      });
    }
  }
  for (const g of data.skills) {
    for (const k of g.keywords) {
      blocks.push({
        blockId: k.id,
        section: `skills: ${g.name}`,
        text: k.text,
      });
    }
  }
  for (const p of data.projects) {
    if (p.description) {
      blocks.push({
        blockId: p.description.id,
        section: `projects: ${p.name}`,
        text: p.description.text,
      });
    }
    for (const h of p.highlights) {
      blocks.push({
        blockId: h.id,
        section: `projects: ${p.name}`,
        text: h.text,
      });
    }
  }
  return blocks;
}

/**
 * Non-anchorable inventory so the reviewer knows what exists in the
 * resume even when a section has no prose text blocks.
 */
export function buildInventory(data: ResumeData) {
  return {
    experience: data.experience.map((w) => `${w.position} at ${w.company}`),
    education: data.education.map((e) =>
      [e.degree, e.fieldOfStudy, e.institution].filter(Boolean).join(", "),
    ),
    skillGroups: data.skills.map((s) => s.name),
    projects: data.projects.map((p) => p.name),
    certifications: data.certifications.map((c) => c.name),
    languages: data.languages.map((l) =>
      [l.language, l.fluency].filter(Boolean).join(" — "),
    ),
  };
}

/**
 * Semantic anchor validation: every finding must reference an existing
 * review block and quote an exact substring of that block's text.
 * No fabrication, correction, or fuzzy matching.
 */
export function validateReviewAnchors(
  review: AiResumeReview,
  blocks: ReviewBlock[],
): boolean {
  const texts = new Map(blocks.map((b) => [b.blockId, b.text]));
  return review.findings.every((f) => {
    const text = texts.get(f.blockId);
    return text !== undefined && f.quote.length > 0 && text.includes(f.quote);
  });
}
