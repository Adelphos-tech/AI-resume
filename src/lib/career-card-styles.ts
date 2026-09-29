/**
 * Stage 7A4F1 — curated Career Card presentation styles.
 *
 * Card Style controls presentation intensity/composition and composes
 * orthogonally with Theme (layout) and Accent (color). Only these two
 * ids may persist — the registry is the single source of truth for the
 * selector and for token resolution.
 */

export type CareerCardStyleId = "standard" | "premium";

export const DEFAULT_CARD_STYLE_ID: CareerCardStyleId = "standard";

export interface CareerCardStyle {
  id: CareerCardStyleId;
  label: string;
  description: string;
}

export const CAREER_CARD_STYLES: readonly CareerCardStyle[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Clean, professional and content-focused.",
  },
  {
    id: "premium",
    label: "Premium",
    description:
      "A richer visual identity with an elevated hero and card-based sections.",
  },
] as const;

export function isCareerCardStyleId(value: string): value is CareerCardStyleId {
  return CAREER_CARD_STYLES.some((s) => s.id === value);
}

/**
 * Safe presentation resolution — an unexpected stored id can never
 * become arbitrary CSS; it falls back to Standard.
 */
export function resolveCareerCardStyle(value: unknown): CareerCardStyleId {
  return typeof value === "string" && isCareerCardStyleId(value)
    ? value
    : DEFAULT_CARD_STYLE_ID;
}
