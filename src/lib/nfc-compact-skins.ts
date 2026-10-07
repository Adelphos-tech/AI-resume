/**
 * NFC Compact skin registry — the trusted finite set of visual skins for
 * the NFC Compact template. Skin is orthogonal to accent: "crimson-night"
 * is a full dark surface system, while `red` remains a light-skin accent.
 *
 * Server and client both resolve through this registry — unknown/invalid
 * values always fall back to Career Passport (the pre-skin appearance).
 */

export type NfcCompactSkinId =
  | "career-passport"
  | "crimson-night"
  | "professional-connect"
  | "creative-spotlight";

export const DEFAULT_NFC_COMPACT_SKIN_ID: NfcCompactSkinId = "career-passport";

export const NFC_COMPACT_SKINS: {
  id: NfcCompactSkinId;
  label: string;
  description: string;
}[] = [
  {
    id: "career-passport",
    label: "Career Passport",
    description: "Clean, modern professional credential.",
  },
  {
    id: "crimson-night",
    label: "Crimson Night",
    description: "Dark, premium crimson credential.",
  },
  {
    id: "professional-connect",
    label: "Professional Connect",
    description: "Investor-style polished professional identity.",
  },
  {
    id: "creative-spotlight",
    label: "Creative Spotlight",
    description: "Celebrity and production company dual-profile showcase.",
  },
];

export function isNfcCompactSkinId(v: unknown): v is NfcCompactSkinId {
  return (
    v === "career-passport" ||
    v === "crimson-night" ||
    v === "professional-connect" ||
    v === "creative-spotlight"
  );
}

/** Defensive resolver — unknown/null → career-passport. */
export function resolveNfcCompactSkin(v: unknown): NfcCompactSkinId {
  return isNfcCompactSkinId(v) ? v : DEFAULT_NFC_COMPACT_SKIN_ID;
}
