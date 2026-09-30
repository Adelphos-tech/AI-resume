/**
 * Stage 7A4E — curated Career Card accent colors.
 *
 * Theme controls layout/typography; the accent id controls trusted
 * presentation accents (CTA, links, badges, markers, rings). Only these
 * six ids may persist or reach presentation — the registry is the single
 * source of truth for the selector and for token resolution.
 */

export type CareerCardAccentColorId =
  "emerald" | "navy" | "blue" | "violet" | "amber" | "neutral" | "red";

export const DEFAULT_ACCENT_COLOR_ID: CareerCardAccentColorId = "emerald";

export interface CareerCardAccentColor {
  id: CareerCardAccentColorId;
  label: string;
  description: string;
  /** Static trusted swatch class for the settings selector. */
  swatchClass: string;
}

export const CAREER_CARD_ACCENT_COLORS: readonly CareerCardAccentColor[] = [
  {
    id: "emerald",
    label: "Emerald",
    description: "RoleRace's signature professional green.",
    swatchClass: "bg-emerald-600",
  },
  {
    id: "navy",
    label: "Navy",
    description: "Structured and corporate.",
    swatchClass: "bg-sky-900",
  },
  {
    id: "blue",
    label: "Blue",
    description: "Clear and modern.",
    swatchClass: "bg-blue-600",
  },
  {
    id: "violet",
    label: "Violet",
    description: "Modern with a creative edge.",
    swatchClass: "bg-violet-600",
  },
  {
    id: "amber",
    label: "Amber",
    description: "Warm and premium.",
    swatchClass: "bg-amber-500",
  },
  {
    id: "neutral",
    label: "Neutral",
    description: "Minimal and understated.",
    swatchClass: "bg-stone-500",
  },
  {
    id: "red",
    label: "Red",
    description: "Bold, premium and confident.",
    swatchClass: "bg-red-700",
  },
] as const;

export function isCareerCardAccentColorId(
  value: string,
): value is CareerCardAccentColorId {
  return CAREER_CARD_ACCENT_COLORS.some((a) => a.id === value);
}

/**
 * Safe presentation resolution — an unexpected stored id can never
 * become arbitrary CSS; it falls back to the RoleRace default.
 */
export function resolveCareerCardAccent(
  value: unknown,
): CareerCardAccentColorId {
  return typeof value === "string" && isCareerCardAccentColorId(value)
    ? value
    : DEFAULT_ACCENT_COLOR_ID;
}
