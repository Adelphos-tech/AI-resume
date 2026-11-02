/**
 * Sponsor placement registry — the only source of truth for where a
 * sponsor strip may appear inside an NFC Compact Career Card. Safe,
 * curated anchor positions only; free pixel positioning is deliberately
 * not offered so a sponsor can never overlap card content.
 *
 * Anchor order is canonical document order — adapters render each slot at
 * the flow position where that section would sit. If a template lacks a
 * neighboring section (e.g. no bio), the slot still renders at the same
 * flow position, so a valid sponsor is never hidden and fallback is
 * deterministic.
 */
export const SPONSOR_PLACEMENTS = [
  {
    id: "after-header",
    label: "After profile header",
    description: "Just below the photo, name and headline",
  },
  {
    id: "after-bio",
    label: "After bio / summary",
    description: "Below the biography or professional summary",
  },
  {
    id: "after-content",
    label: "After professional content",
    description: "Below experience, skills and details",
  },
  {
    id: "after-links",
    label: "After links & social",
    description: "Below contact and social links",
  },
  {
    id: "before-footer",
    label: "Near bottom — before footer",
    description: "Above the card's bottom action area",
  },
] as const;

export type SponsorPlacement = (typeof SPONSOR_PLACEMENTS)[number]["id"];

/** Pre-placement-feature position — sponsors originally rendered here. */
export const DEFAULT_SPONSOR_PLACEMENT: SponsorPlacement = "before-footer";

/** Anchor slots that live inside card content (the fifth, before-footer,
 *  is rendered by the shell just above the CTA). */
export const CONTENT_ANCHORS = [
  "after-header",
  "after-bio",
  "after-content",
  "after-links",
] as const satisfies readonly SponsorPlacement[];

export type ContentAnchor = (typeof CONTENT_ANCHORS)[number];

const IDS = new Set<string>(SPONSOR_PLACEMENTS.map((p) => p.id));

export function isSponsorPlacement(v: string): v is SponsorPlacement {
  return IDS.has(v);
}

/**
 * Defensive resolution — NULL/unknown/missing always maps to the
 * established default. Used identically by the Builder preview and the
 * public DTO so the two can never drift apart.
 */
export function resolveSponsorPlacement(
  value: string | null | undefined,
): SponsorPlacement {
  return value && isSponsorPlacement(value) ? value : DEFAULT_SPONSOR_PLACEMENT;
}
