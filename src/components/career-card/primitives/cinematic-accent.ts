import type { CSSProperties } from "react";
import type { CareerCardAccentColorId } from "@/lib/career-card-accent-colors";

/**
 * Cinematic accent variables — trusted finite registry mapping each
 * accentColorId to CSS custom properties consumed by the Executive
 * library var classes. Static values only; nothing is interpolated
 * from user/DB input.
 */

export type CinematicAccent = CareerCardAccentColorId;

const build = (o: {
  label: string;
  text: string;
  accent: string;
  edge: string;
  edgeHi: string;
  tint: string;
  halo: string;
  ring: string;
  btn1: string;
  btn2: string;
  btnGlow: string;
  feature: string;
  cover: string;
}): CSSProperties =>
  ({
    "--cc-label": o.label,
    "--cc-text": o.text,
    "--cc-accent": o.accent,
    "--cc-edge": o.edge,
    "--cc-edge-hi": o.edgeHi,
    "--cc-tint": o.tint,
    "--cc-halo": o.halo,
    "--cc-ring": o.ring,
    "--cc-btn1": o.btn1,
    "--cc-btn2": o.btn2,
    "--cc-btn-glow": o.btnGlow,
    "--cc-feature": o.feature,
    "--cc-cover-bg": o.cover,
  }) as CSSProperties;

const cover = (hi: string, a: string, deep: string) =>
  `radial-gradient(ellipse 90% 70% at 80% 0%,${hi},transparent 60%),radial-gradient(ellipse 70% 60% at 5% 100%,${a},transparent),linear-gradient(165deg,${deep} 0%,#17121f 45%,#0c0a09 100%)`;

export const CINEMATIC_ACCENT_VARS: Record<CinematicAccent, CSSProperties> = {
  emerald: build({
    label: "rgba(52,211,153,0.8)",
    text: "#6ee7b7",
    accent: "#34d399",
    edge: "rgba(16,185,129,0.28)",
    edgeHi: "rgba(16,185,129,0.45)",
    tint: "rgba(16,185,129,0.10)",
    halo: "rgba(16,185,129,0.25)",
    ring: "rgba(52,211,153,0.4)",
    btn1: "#10b981",
    btn2: "#047857",
    btnGlow: "rgba(52,211,153,0.45)",
    feature: "rgba(16,185,129,0.16)",
    cover: cover("rgba(52,211,153,0.28)", "rgba(16,185,129,0.16)", "#0b2b22"),
  }),
  navy: build({
    label: "rgba(56,189,248,0.8)",
    text: "#7dd3fc",
    accent: "#38bdf8",
    edge: "rgba(14,165,233,0.28)",
    edgeHi: "rgba(14,165,233,0.45)",
    tint: "rgba(14,165,233,0.10)",
    halo: "rgba(14,165,233,0.25)",
    ring: "rgba(56,189,248,0.4)",
    btn1: "#0ea5e9",
    btn2: "#0369a1",
    btnGlow: "rgba(56,189,248,0.45)",
    feature: "rgba(14,165,233,0.16)",
    cover: cover("rgba(56,189,248,0.28)", "rgba(14,165,233,0.16)", "#0b2038"),
  }),
  blue: build({
    label: "rgba(96,165,250,0.8)",
    text: "#93c5fd",
    accent: "#60a5fa",
    edge: "rgba(59,130,246,0.28)",
    edgeHi: "rgba(59,130,246,0.45)",
    tint: "rgba(59,130,246,0.10)",
    halo: "rgba(59,130,246,0.25)",
    ring: "rgba(96,165,250,0.4)",
    btn1: "#3b82f6",
    btn2: "#1d4ed8",
    btnGlow: "rgba(96,165,250,0.45)",
    feature: "rgba(59,130,246,0.16)",
    cover: cover("rgba(96,165,250,0.28)", "rgba(59,130,246,0.16)", "#101b3a"),
  }),
  violet: build({
    label: "rgba(167,139,250,0.8)",
    text: "#c4b5fd",
    accent: "#a78bfa",
    edge: "rgba(139,92,246,0.28)",
    edgeHi: "rgba(139,92,246,0.45)",
    tint: "rgba(139,92,246,0.10)",
    halo: "rgba(139,92,246,0.25)",
    ring: "rgba(167,139,250,0.4)",
    btn1: "#8b5cf6",
    btn2: "#6d28d9",
    btnGlow: "rgba(139,92,246,0.45)",
    feature: "rgba(139,92,246,0.16)",
    cover: cover("rgba(167,139,250,0.28)", "rgba(124,58,237,0.16)", "#231b4b"),
  }),
  amber: build({
    label: "rgba(251,191,36,0.8)",
    text: "#fcd34d",
    accent: "#fbbf24",
    edge: "rgba(245,158,11,0.28)",
    edgeHi: "rgba(245,158,11,0.45)",
    tint: "rgba(245,158,11,0.10)",
    halo: "rgba(245,158,11,0.25)",
    ring: "rgba(251,191,36,0.4)",
    btn1: "#f59e0b",
    btn2: "#b45309",
    btnGlow: "rgba(251,191,36,0.45)",
    feature: "rgba(245,158,11,0.16)",
    cover: cover("rgba(251,191,36,0.28)", "rgba(245,158,11,0.16)", "#2b1d05"),
  }),
  neutral: build({
    label: "rgba(214,211,209,0.8)",
    text: "#d6d3d1",
    accent: "#d6d3d1",
    edge: "rgba(168,162,158,0.28)",
    edgeHi: "rgba(168,162,158,0.45)",
    tint: "rgba(168,162,158,0.10)",
    halo: "rgba(168,162,158,0.25)",
    ring: "rgba(214,211,209,0.4)",
    btn1: "#78716c",
    btn2: "#57534e",
    btnGlow: "rgba(120,113,108,0.45)",
    feature: "rgba(168,162,158,0.16)",
    cover: cover("rgba(214,211,209,0.20)", "rgba(120,113,108,0.14)", "#1c1917"),
  }),
};
