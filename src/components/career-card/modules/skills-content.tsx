/**
 * Semantic Skills content — a flat, data-driven skill list.
 * No invented categories: groupings must come from real data.
 */

/** Joins skill names into a separator-delimited prose line. */
export function skillLine(skills: string[], sep = " · ") {
  return skills.join(sep);
}
