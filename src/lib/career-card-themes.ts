/**
 * Curated Career Card theme registry.
 *
 * Themes are application-owned presentation definitions — never user
 * code, never stored class names in the database, and never loaded from
 * the DB. The database persists only the theme id on PublicProfile.
 */

export type CareerCardThemeId =
  "role-race-classic" | "corporate-clean" | "executive-dark" | "tech-minimal";

export type CareerCardTheme = {
  id: CareerCardThemeId;
  label: string;
  description: string;
  /** Short candidate-fit chips shown on the selector card. */
  fits: string[];
};

export const DEFAULT_CAREER_CARD_THEME: CareerCardThemeId = "role-race-classic";

export const CAREER_CARD_THEMES: readonly CareerCardTheme[] = [
  {
    id: "role-race-classic",
    label: "RoleRace Classic",
    description: "The current RoleRace style — warm green and white.",
    fits: ["General professional", "Any role"],
  },
  {
    id: "corporate-clean",
    label: "Corporate Clean",
    description: "Structured and professional.",
    fits: ["Product", "Business", "Consulting"],
  },
  {
    id: "executive-dark",
    label: "Executive Dark",
    description: "Premium leadership presentation.",
    fits: ["Founders", "Directors", "Senior leaders"],
  },
  {
    id: "tech-minimal",
    label: "Tech Minimal",
    description: "Compact, technical clarity.",
    fits: ["Engineering", "Data", "Technology"],
  },
] as const;

const THEME_IDS = new Set<string>(CAREER_CARD_THEMES.map((t) => t.id));

export function isCareerCardThemeId(
  value: unknown,
): value is CareerCardThemeId {
  return typeof value === "string" && THEME_IDS.has(value);
}

/** Safe resolution — unknown/missing ids always fall back to classic. */
export function resolveCareerCardTheme(value: unknown): CareerCardThemeId {
  return isCareerCardThemeId(value) ? value : DEFAULT_CAREER_CARD_THEME;
}
