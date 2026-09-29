/**
 * Semantic Education content — shared understanding of academic entries.
 * Compositions own geometry; this owns data shape + range formatting.
 */
import type { DemoEducation } from "@/components/career-card/dev/demo-career-profile";

export type { DemoEducation };

/** "2012–2016", "2016", "" when absent. */
export function formatEducationRange(e: Pick<DemoEducation, "start" | "end">) {
  if (e.start && e.end) return `${e.start}–${e.end}`;
  return e.end ?? e.start ?? "";
}

/** "MBA, Business & Technology" / "B.S. Computer Science". */
export function degreeLine(e: Pick<DemoEducation, "degree" | "fieldOfStudy">) {
  return e.fieldOfStudy ? `${e.degree}, ${e.fieldOfStudy}` : e.degree;
}
