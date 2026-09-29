import type { CSSProperties } from "react";
import type { CareerCardAccentColorId } from "@/lib/career-card-accent-colors";

/**
 * Corporate accent variables — restrained, business-like accent mapping
 * for the Split family. Deliberately quieter than Cinematic: a solid CTA,
 * small link/icon accents and a structured tinted media fallback.
 * Static values only — no DB/user interpolation.
 */

export type CorporateAccent = CareerCardAccentColorId;

const build = (o: {
  accent: string;
  btn: string;
  btnHover: string;
  avatar: string;
  cover: string;
}): CSSProperties =>
  ({
    "--cc-c-accent": o.accent,
    "--cc-c-btn": o.btn,
    "--cc-c-btn-hover": o.btnHover,
    "--cc-c-avatar": o.avatar,
    "--cc-c-cover-bg": o.cover,
  }) as CSSProperties;

const cover = (tint: string) =>
  `linear-gradient(155deg,${tint} 0%,#0f172a 68%,#020617 100%)`;

export const CORPORATE_ACCENT_VARS: Record<CorporateAccent, CSSProperties> = {
  emerald: build({
    accent: "#047857",
    btn: "#065f46",
    btnHover: "#064e3b",
    avatar: "#065f46",
    cover: cover("#0c2f26"),
  }),
  navy: build({
    accent: "#0369a1",
    btn: "#075985",
    btnHover: "#0c4a6e",
    avatar: "#0c4a6e",
    cover: cover("#0b2237"),
  }),
  blue: build({
    accent: "#2563eb",
    btn: "#1d4ed8",
    btnHover: "#1e40af",
    avatar: "#1e40af",
    cover: cover("#122342"),
  }),
  violet: build({
    accent: "#6d28d9",
    btn: "#5b21b6",
    btnHover: "#4c1d95",
    avatar: "#4c1d95",
    cover: cover("#201a4a"),
  }),
  amber: build({
    accent: "#b45309",
    btn: "#92400e",
    btnHover: "#78350f",
    avatar: "#92400e",
    cover: cover("#31230c"),
  }),
  neutral: build({
    accent: "#57534e",
    btn: "#1e293b",
    btnHover: "#334155",
    avatar: "#1e293b",
    cover: cover("#1e293b"),
  }),
};
