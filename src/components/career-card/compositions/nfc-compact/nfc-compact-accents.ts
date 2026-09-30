import type { CSSProperties } from "react";

import {
  isCareerCardAccentColorId,
  type CareerCardAccentColorId,
} from "@/lib/career-card-accent-colors";

/**
 * Stage 7A5H2B accent plumbing — finite trusted semantic tokens for the
 * frozen NFC Compact composition. Values are hardcoded here only; the
 * database supplies just the accent id, resolved through the existing
 * Career Card accent registry. Unknown ids fall back to the frozen
 * blue palette.
 */
type NfcAccentTokens = {
  cta: string;
  ctaHover: string;
  strong: string;
};

const NFC_COMPACT_ACCENTS: Record<CareerCardAccentColorId, NfcAccentTokens> = {
  // Frozen default — identical to the approved lab palette.
  blue: { cta: "#1e3a8a", ctaHover: "#172554", strong: "#1e3a8a" },
  emerald: { cta: "#065f46", ctaHover: "#064e3b", strong: "#065f46" },
  navy: { cta: "#075985", ctaHover: "#0c4a6e", strong: "#075985" },
  violet: { cta: "#5b21b6", ctaHover: "#4c1d95", strong: "#5b21b6" },
  amber: { cta: "#92400e", ctaHover: "#78350f", strong: "#92400e" },
  neutral: { cta: "#1e293b", ctaHover: "#0f172a", strong: "#1e293b" },
};

export function nfcCompactAccentStyle(accentId: unknown): CSSProperties {
  const a =
    typeof accentId === "string" && isCareerCardAccentColorId(accentId)
      ? NFC_COMPACT_ACCENTS[accentId]
      : NFC_COMPACT_ACCENTS.blue;
  return {
    "--nfc-cta": a.cta,
    "--nfc-cta-hover": a.ctaHover,
    "--nfc-strong": a.strong,
  } as CSSProperties;
}
