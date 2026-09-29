/**
 * Career Card theme styles — composed tokens.
 *
 * Theme = layout/typography/frame tokens (builder functions below).
 * Accent = trusted presentation fragments resolved from the curated
 * CAREER_CARD_ACCENT_COLORS registry. The two are composed at lookup
 * time; no theme object is duplicated per accent.
 *
 * Emerald token values are a regression anchor — they reproduce the
 * exact pre-7A4E classes.
 */

import { resolveCareerCardTheme } from "@/lib/career-card-themes";
import {
  resolveCareerCardAccent,
  type CareerCardAccentColorId,
} from "@/lib/career-card-accent-colors";
import { resolveCareerCardStyle } from "@/lib/career-card-styles";

export type CardThemeTokens = {
  page: string;
  card: string;
  h1: string;
  headline: string;
  body: string;
  strong: string;
  subtle: string;
  faint: string;
  innerCard: string;
  meta: string;
  h2: string;
  /** Accent text (open-to-work line, section markers). */
  accent: string;
  accentIcon: string;
  /** Meta label rendered as an accent section marker — same tracking as
   * `meta` but with the accent foreground (fixes a cascade collision where
   * the neutral meta color won over `accent`). */
  accentMeta: string;
  button: string;
  avatar: string;
  avatarImg: string;
  /** Cover photo frame — theme-controlled shape/size. */
  coverWrap: string;
  /** Optional theme-owned overlay over the cover (executive gradient). */
  coverOverlay: string;
  /** Pull that overlaps the avatar into the cover. */
  coverAvatarPull: string;
  /** "Open to opportunities" pill. */
  openBadge: string;
  factsPanel: string;
  factLabel: string;
  factValue: string;
  chip: string;
  skillChip: string;
  /** Timeline dot + connector for experience. */
  timelineDot: string;
  timelineLine: string;
  /** Social icon buttons. */
  socialBtn: string;
  /** Inline text links (project View ↗). */
  link: string;
  /** Footer text. */
  footer: string;
  footerBrand: string;
};

// ── Accent token contracts ────────────────────────────────────────────

/** Accent fragments consumed by the light-surface themes. */
interface LightAccent {
  text: string;
  textHover: string;
  textStrong: string;
  textStrongHover: string;
  /** Deepest badge text (corporate openBadge). */
  textBadge: string;
  /** Accent text rendered on structural dark surfaces (tech mono). */
  textOnDark: string;
  /** Pale accent text for corporate avatar initials. */
  textAvatar: string;
  cta: string;
  ctaHover: string;
  ctaDeep: string;
  ctaDeepHover: string;
  /** Tech's deliberately monochrome-leaning CTA. */
  ctaMono: string;
  ctaMonoHover: string;
  softBg: string;
  softBgSoft: string;
  softBgSofter: string;
  borderSoft: string;
  borderSofter: string;
  borderMed: string;
  borderMedDeep: string;
  borderSoftDeep: string;
  borderStrong: string;
  ringSoft: string;
  ringDim: string;
  dot: string;
  dotDeep: string;
  line: string;
  hoverBorder: string;
  hoverBorderDeep: string;
  hoverText: string;
  hoverTextDeep: string;
  /** Classic's subtle page-gradient tint. */
  pageTint: string;
  /** Premium portrait ring (accent-aware, restrained). */
  ringAccent: string;
  /** Premium no-cover hero gradient source. */
  heroTint: string;
  /** Premium section-card top accent edge. */
  edge: string;
  /** Premium secondary-action pill foreground/bg. */
  pill: string;
  pillHover: string;
  /** Premium primary-CTA depth shadow. */
  ctaGlow: string;
  /** Border-Beam color + Magic-Card spotlight color (rgba strings). */
  beam: string;
  spot: string;
  /** Premium card top accent hairline gradient. */
  hairline: string;
}

/** Accent fragments consumed by Executive Dark. */
interface DarkAccent {
  text: string;
  textHover: string;
  textSoft: string;
  headline: string;
  chipText: string;
  cta: string;
  ctaHover: string;
  avatarGradFrom: string;
  avatarGradTo: string;
  ring: string;
  softBg: string;
  borderSoft: string;
  borderSofter: string;
  dot: string;
  hoverBorder: string;
  footer: string;
  /** Premium portrait ring + hero band tint + section edge + action pill. */
  ringAccent: string;
  heroTint: string;
  edge: string;
  pill: string;
  pillHover: string;
  /** Premium-only: subtle accent illumination on the dark page canvas. */
  pageGlow: string;
  /** Premium primary-CTA depth shadow. */
  ctaGlow: string;
  /** Border-Beam color + Magic-Card spotlight color (rgba strings). */
  beam: string;
  spot: string;
  /** Premium card top accent hairline gradient. */
  hairline: string;
}

// ── Curated accent fragments (trusted static classes only) ────────────

const LIGHT_ACCENTS: Record<CareerCardAccentColorId, LightAccent> = {
  emerald: {
    text: "text-emerald-700",
    textHover: "hover:text-emerald-800",
    textStrong: "text-emerald-800",
    textStrongHover: "hover:text-emerald-900",
    textBadge: "text-emerald-900",
    textOnDark: "text-emerald-400",
    textAvatar: "text-emerald-100",
    cta: "bg-emerald-700 text-white",
    ctaHover: "hover:bg-emerald-800",
    ctaDeep: "bg-emerald-800 text-white",
    ctaDeepHover: "hover:bg-emerald-900",
    ctaMono: "bg-neutral-900 text-white",
    ctaMonoHover: "hover:bg-neutral-700",
    softBg: "bg-emerald-50",
    softBgSoft: "bg-emerald-50/50",
    softBgSofter: "bg-emerald-50/60",
    borderSoft: "border-emerald-600/25",
    borderSofter: "border-emerald-600/20",
    borderMed: "border-emerald-600/30",
    borderMedDeep: "border-emerald-700/30",
    borderSoftDeep: "border-emerald-800/20",
    borderStrong: "border-emerald-700/50",
    ringSoft: "ring-emerald-50",
    ringDim: "ring-emerald-700/15",
    dot: "bg-emerald-600",
    dotDeep: "bg-emerald-800",
    line: "bg-emerald-600/15",
    hoverBorder: "hover:border-emerald-600/40",
    hoverBorderDeep: "hover:border-emerald-700/50",
    hoverText: "hover:text-emerald-700",
    hoverTextDeep: "hover:text-emerald-800",
    pageTint: "from-emerald-50/60",
    ringAccent: "ring-4 ring-emerald-600/30 ring-offset-4 ring-offset-white",
    heroTint: "from-emerald-50/80 via-white",
    edge: "border-t-2 border-t-emerald-600/40",
    pill: "border border-emerald-600/25 bg-emerald-50/60 text-emerald-800",
    pillHover: "hover:bg-emerald-100/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(4,120,87,0.35)]",
    beam: "rgba(4,120,87,0.75)",
    spot: "rgba(4,120,87,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-emerald-600/60 to-transparent",
  },
  navy: {
    text: "text-sky-900",
    textHover: "hover:text-sky-950",
    textStrong: "text-sky-900",
    textStrongHover: "hover:text-sky-950",
    textBadge: "text-sky-950",
    textOnDark: "text-sky-400",
    textAvatar: "text-sky-100",
    cta: "bg-sky-900 text-white",
    ctaHover: "hover:bg-sky-950",
    ctaDeep: "bg-sky-900 text-white",
    ctaDeepHover: "hover:bg-sky-950",
    ctaMono: "bg-sky-900 text-white",
    ctaMonoHover: "hover:bg-sky-950",
    softBg: "bg-sky-50",
    softBgSoft: "bg-sky-50/50",
    softBgSofter: "bg-sky-50/60",
    borderSoft: "border-sky-800/25",
    borderSofter: "border-sky-800/20",
    borderMed: "border-sky-800/30",
    borderMedDeep: "border-sky-800/30",
    borderSoftDeep: "border-sky-800/20",
    borderStrong: "border-sky-800/50",
    ringSoft: "ring-sky-50",
    ringDim: "ring-sky-800/15",
    dot: "bg-sky-800",
    dotDeep: "bg-sky-900",
    line: "bg-sky-800/15",
    hoverBorder: "hover:border-sky-800/40",
    hoverBorderDeep: "hover:border-sky-800/50",
    hoverText: "hover:text-sky-900",
    hoverTextDeep: "hover:text-sky-900",
    pageTint: "from-sky-50/70",
    ringAccent: "ring-4 ring-sky-800/30 ring-offset-4 ring-offset-white",
    heroTint: "from-sky-50/80 via-white",
    edge: "border-t-2 border-t-sky-800/40",
    pill: "border border-sky-800/25 bg-sky-50/60 text-sky-900",
    pillHover: "hover:bg-sky-100/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(3,105,161,0.35)]",
    beam: "rgba(3,105,161,0.75)",
    spot: "rgba(3,105,161,0.10)",
    hairline: "bg-gradient-to-r from-transparent via-sky-800/60 to-transparent",
  },
  blue: {
    text: "text-blue-800",
    textHover: "hover:text-blue-900",
    textStrong: "text-blue-800",
    textStrongHover: "hover:text-blue-900",
    textBadge: "text-blue-900",
    textOnDark: "text-blue-400",
    textAvatar: "text-blue-100",
    cta: "bg-blue-600 text-white",
    ctaHover: "hover:bg-blue-700",
    ctaDeep: "bg-blue-700 text-white",
    ctaDeepHover: "hover:bg-blue-800",
    ctaMono: "bg-blue-600 text-white",
    ctaMonoHover: "hover:bg-blue-700",
    softBg: "bg-blue-50",
    softBgSoft: "bg-blue-50/50",
    softBgSofter: "bg-blue-50/60",
    borderSoft: "border-blue-600/25",
    borderSofter: "border-blue-600/20",
    borderMed: "border-blue-600/30",
    borderMedDeep: "border-blue-700/30",
    borderSoftDeep: "border-blue-700/20",
    borderStrong: "border-blue-600/50",
    ringSoft: "ring-blue-50",
    ringDim: "ring-blue-700/15",
    dot: "bg-blue-600",
    dotDeep: "bg-blue-700",
    line: "bg-blue-600/15",
    hoverBorder: "hover:border-blue-600/40",
    hoverBorderDeep: "hover:border-blue-700/50",
    hoverText: "hover:text-blue-800",
    hoverTextDeep: "hover:text-blue-800",
    pageTint: "from-blue-50/60",
    ringAccent: "ring-4 ring-blue-600/30 ring-offset-4 ring-offset-white",
    heroTint: "from-blue-50/80 via-white",
    edge: "border-t-2 border-t-blue-600/40",
    pill: "border border-blue-600/25 bg-blue-50/60 text-blue-800",
    pillHover: "hover:bg-blue-100/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(37,99,235,0.35)]",
    beam: "rgba(37,99,235,0.75)",
    spot: "rgba(37,99,235,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-blue-600/60 to-transparent",
  },
  violet: {
    text: "text-violet-700",
    textHover: "hover:text-violet-800",
    textStrong: "text-violet-800",
    textStrongHover: "hover:text-violet-900",
    textBadge: "text-violet-900",
    textOnDark: "text-violet-400",
    textAvatar: "text-violet-100",
    cta: "bg-violet-600 text-white",
    ctaHover: "hover:bg-violet-700",
    ctaDeep: "bg-violet-700 text-white",
    ctaDeepHover: "hover:bg-violet-800",
    ctaMono: "bg-violet-600 text-white",
    ctaMonoHover: "hover:bg-violet-700",
    softBg: "bg-violet-50",
    softBgSoft: "bg-violet-50/50",
    softBgSofter: "bg-violet-50/60",
    borderSoft: "border-violet-600/25",
    borderSofter: "border-violet-600/20",
    borderMed: "border-violet-600/30",
    borderMedDeep: "border-violet-700/30",
    borderSoftDeep: "border-violet-700/20",
    borderStrong: "border-violet-600/50",
    ringSoft: "ring-violet-50",
    ringDim: "ring-violet-700/15",
    dot: "bg-violet-600",
    dotDeep: "bg-violet-700",
    line: "bg-violet-600/15",
    hoverBorder: "hover:border-violet-600/40",
    hoverBorderDeep: "hover:border-violet-700/50",
    hoverText: "hover:text-violet-700",
    hoverTextDeep: "hover:text-violet-800",
    pageTint: "from-violet-50/60",
    ringAccent: "ring-4 ring-violet-600/30 ring-offset-4 ring-offset-white",
    heroTint: "from-violet-50/80 via-white",
    edge: "border-t-2 border-t-violet-600/40",
    pill: "border border-violet-600/25 bg-violet-50/60 text-violet-800",
    pillHover: "hover:bg-violet-100/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(124,58,237,0.35)]",
    beam: "rgba(124,58,237,0.75)",
    spot: "rgba(124,58,237,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-violet-600/60 to-transparent",
  },
  amber: {
    // Deep-amber foregrounds keep light-surface text readable — no
    // low-contrast yellow-on-white.
    text: "text-amber-800",
    textHover: "hover:text-amber-900",
    textStrong: "text-amber-900",
    textStrongHover: "hover:text-amber-950",
    textBadge: "text-amber-950",
    textOnDark: "text-amber-400",
    textAvatar: "text-amber-100",
    cta: "bg-amber-700 text-white",
    ctaHover: "hover:bg-amber-800",
    ctaDeep: "bg-amber-800 text-white",
    ctaDeepHover: "hover:bg-amber-900",
    ctaMono: "bg-amber-700 text-white",
    ctaMonoHover: "hover:bg-amber-800",
    softBg: "bg-amber-50",
    softBgSoft: "bg-amber-50/50",
    softBgSofter: "bg-amber-50/60",
    borderSoft: "border-amber-700/25",
    borderSofter: "border-amber-700/20",
    borderMed: "border-amber-700/30",
    borderMedDeep: "border-amber-700/30",
    borderSoftDeep: "border-amber-700/20",
    borderStrong: "border-amber-700/50",
    ringSoft: "ring-amber-50",
    ringDim: "ring-amber-700/15",
    dot: "bg-amber-600",
    dotDeep: "bg-amber-700",
    line: "bg-amber-600/15",
    hoverBorder: "hover:border-amber-600/40",
    hoverBorderDeep: "hover:border-amber-700/50",
    hoverText: "hover:text-amber-800",
    hoverTextDeep: "hover:text-amber-900",
    pageTint: "from-amber-50/60",
    ringAccent: "ring-4 ring-amber-600/30 ring-offset-4 ring-offset-white",
    heroTint: "from-amber-50/80 via-white",
    edge: "border-t-2 border-t-amber-600/40",
    pill: "border border-amber-700/25 bg-amber-50/60 text-amber-800",
    pillHover: "hover:bg-amber-100/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(180,83,9,0.35)]",
    beam: "rgba(180,83,9,0.70)",
    spot: "rgba(180,83,9,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-amber-700/60 to-transparent",
  },
  neutral: {
    // Slate/graphite — restrained but keeps hierarchy obvious.
    text: "text-stone-700",
    textHover: "hover:text-stone-800",
    textStrong: "text-stone-800",
    textStrongHover: "hover:text-stone-900",
    textBadge: "text-stone-900",
    textOnDark: "text-stone-300",
    textAvatar: "text-stone-200",
    cta: "bg-stone-800 text-white",
    ctaHover: "hover:bg-stone-900",
    ctaDeep: "bg-stone-900 text-white",
    ctaDeepHover: "hover:bg-stone-950",
    ctaMono: "bg-stone-800 text-white",
    ctaMonoHover: "hover:bg-stone-900",
    softBg: "bg-stone-100",
    softBgSoft: "bg-stone-100/70",
    softBgSofter: "bg-stone-100/80",
    borderSoft: "border-stone-400/40",
    borderSofter: "border-stone-300",
    borderMed: "border-stone-400/50",
    borderMedDeep: "border-stone-500/40",
    borderSoftDeep: "border-stone-400/30",
    borderStrong: "border-stone-500/60",
    ringSoft: "ring-stone-100",
    ringDim: "ring-stone-500/20",
    dot: "bg-stone-500",
    dotDeep: "bg-stone-700",
    line: "bg-stone-500/20",
    hoverBorder: "hover:border-stone-500/50",
    hoverBorderDeep: "hover:border-stone-600/60",
    hoverText: "hover:text-stone-700",
    hoverTextDeep: "hover:text-stone-800",
    pageTint: "from-stone-50",
    ringAccent: "ring-4 ring-stone-500/40 ring-offset-4 ring-offset-white",
    heroTint: "from-stone-100/80 via-white",
    edge: "border-t-2 border-t-stone-500/50",
    pill: "border border-stone-400/40 bg-stone-100/70 text-stone-800",
    pillHover: "hover:bg-stone-200/70",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(68,64,60,0.30)]",
    beam: "rgba(87,83,78,0.60)",
    spot: "rgba(87,83,78,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-stone-700/50 to-transparent",
  },
};

const DARK_ACCENTS: Record<CareerCardAccentColorId, DarkAccent> = {
  emerald: {
    text: "text-emerald-400",
    textHover: "hover:text-emerald-300",
    textSoft: "text-emerald-300",
    headline: "text-emerald-300/90",
    chipText: "text-emerald-200",
    cta: "bg-emerald-500 text-stone-950",
    ctaHover: "hover:bg-emerald-400",
    avatarGradFrom: "from-emerald-500",
    avatarGradTo: "to-emerald-800",
    ring: "ring-emerald-400/25",
    softBg: "bg-emerald-500/10",
    borderSoft: "border-emerald-500/30",
    borderSofter: "border-emerald-500/25",
    dot: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-500/50",
    footer: "bg-emerald-500 text-stone-950",
    ringAccent:
      "ring-4 ring-emerald-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(52,211,153,0.35)]",
    heroTint: "from-emerald-500/15 via-stone-900/60",
    edge: "border-t-2 border-t-emerald-500/50",
    pill: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    pillHover: "hover:bg-emerald-500/20",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(16,185,129,0.14),transparent)]",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)]",
    beam: "rgba(52,211,153,0.85)",
    spot: "rgba(52,211,153,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent",
  },
  navy: {
    // Steel-blue interpretation — readable against dark charcoal.
    text: "text-sky-300",
    textHover: "hover:text-sky-200",
    textSoft: "text-sky-300",
    headline: "text-sky-300/90",
    chipText: "text-sky-200",
    cta: "bg-sky-700 text-white",
    ctaHover: "hover:bg-sky-600",
    avatarGradFrom: "from-sky-500",
    avatarGradTo: "to-sky-800",
    ring: "ring-sky-400/25",
    softBg: "bg-sky-500/10",
    borderSoft: "border-sky-500/30",
    borderSofter: "border-sky-500/25",
    dot: "bg-sky-400",
    hoverBorder: "hover:border-sky-500/50",
    footer: "bg-sky-700 text-white",
    ringAccent:
      "ring-4 ring-sky-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(56,189,248,0.35)]",
    heroTint: "from-sky-500/15 via-stone-900/60",
    edge: "border-t-2 border-t-sky-500/50",
    pill: "border border-sky-500/30 bg-sky-500/10 text-sky-200",
    pillHover: "hover:bg-sky-500/20",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(56,189,248,0.14),transparent)]",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(56,189,248,0.45)]",
    beam: "rgba(56,189,248,0.85)",
    spot: "rgba(56,189,248,0.10)",
    hairline: "bg-gradient-to-r from-transparent via-sky-500/60 to-transparent",
  },
  blue: {
    text: "text-blue-300",
    textHover: "hover:text-blue-200",
    textSoft: "text-blue-300",
    headline: "text-blue-300/90",
    chipText: "text-blue-200",
    cta: "bg-blue-500 text-stone-950",
    ctaHover: "hover:bg-blue-400",
    avatarGradFrom: "from-blue-500",
    avatarGradTo: "to-blue-800",
    ring: "ring-blue-400/25",
    softBg: "bg-blue-500/10",
    borderSoft: "border-blue-500/30",
    borderSofter: "border-blue-500/25",
    dot: "bg-blue-400",
    hoverBorder: "hover:border-blue-500/50",
    footer: "bg-blue-500 text-stone-950",
    ringAccent:
      "ring-4 ring-blue-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(96,165,250,0.35)]",
    heroTint: "from-blue-500/15 via-stone-900/60",
    edge: "border-t-2 border-t-blue-500/50",
    pill: "border border-blue-500/30 bg-blue-500/10 text-blue-200",
    pillHover: "hover:bg-blue-500/20",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(96,165,250,0.45)]",
    beam: "rgba(96,165,250,0.85)",
    spot: "rgba(96,165,250,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-blue-500/60 to-transparent",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(96,165,250,0.14),transparent)]",
  },
  violet: {
    text: "text-violet-300",
    textHover: "hover:text-violet-200",
    textSoft: "text-violet-300",
    headline: "text-violet-300/90",
    chipText: "text-violet-200",
    cta: "bg-violet-600 text-white",
    ctaHover: "hover:bg-violet-500",
    avatarGradFrom: "from-violet-500",
    avatarGradTo: "to-violet-800",
    ring: "ring-violet-400/25",
    softBg: "bg-violet-500/10",
    borderSoft: "border-violet-500/30",
    borderSofter: "border-violet-500/25",
    dot: "bg-violet-400",
    hoverBorder: "hover:border-violet-500/50",
    footer: "bg-violet-600 text-white",
    ringAccent:
      "ring-4 ring-violet-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(167,139,250,0.35)]",
    heroTint: "from-violet-500/15 via-stone-900/60",
    edge: "border-t-2 border-t-violet-500/50",
    pill: "border border-violet-500/30 bg-violet-500/10 text-violet-200",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(139,92,246,0.45)]",
    beam: "rgba(167,139,250,0.9)",
    spot: "rgba(167,139,250,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-violet-500/60 to-transparent",
    pillHover: "hover:bg-violet-500/20",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(167,139,250,0.14),transparent)]",
  },
  amber: {
    // Gold treatment — premium, not bright yellow.
    text: "text-amber-300",
    textHover: "hover:text-amber-200",
    textSoft: "text-amber-300",
    headline: "text-amber-300/90",
    chipText: "text-amber-200",
    cta: "bg-amber-400 text-stone-950",
    ctaHover: "hover:bg-amber-300",
    avatarGradFrom: "from-amber-400",
    avatarGradTo: "to-amber-700",
    ring: "ring-amber-400/25",
    softBg: "bg-amber-400/10",
    borderSoft: "border-amber-400/30",
    borderSofter: "border-amber-400/25",
    dot: "bg-amber-400",
    hoverBorder: "hover:border-amber-400/50",
    footer: "bg-amber-400 text-stone-950",
    ringAccent:
      "ring-4 ring-amber-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(251,191,36,0.30)]",
    heroTint: "from-amber-400/15 via-stone-900/60",
    edge: "border-t-2 border-t-amber-400/50",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(251,191,36,0.45)]",
    beam: "rgba(251,191,36,0.8)",
    spot: "rgba(251,191,36,0.10)",
    hairline:
      "bg-gradient-to-r from-transparent via-amber-400/60 to-transparent",
    pill: "border border-amber-400/30 bg-amber-400/10 text-amber-200",
    pillHover: "hover:bg-amber-400/20",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(251,191,36,0.12),transparent)]",
  },
  neutral: {
    text: "text-stone-300",
    textHover: "hover:text-stone-200",
    textSoft: "text-stone-300",
    headline: "text-stone-300/90",
    chipText: "text-stone-200",
    cta: "bg-stone-200 text-stone-950",
    ctaHover: "hover:bg-white",
    avatarGradFrom: "from-stone-300",
    avatarGradTo: "to-stone-500",
    ring: "ring-stone-400/25",
    softBg: "bg-stone-400/10",
    borderSoft: "border-stone-400/30",
    borderSofter: "border-stone-400/25",
    dot: "bg-stone-400",
    hoverBorder: "hover:border-stone-400/50",
    footer: "bg-stone-200 text-stone-950",
    ringAccent:
      "ring-4 ring-stone-400/40 ring-offset-4 ring-offset-stone-900 shadow-[0_0_32px_-8px_rgba(214,211,209,0.25)]",
    ctaGlow: "shadow-[0_8px_24px_-6px_rgba(120,113,108,0.45)]",
    beam: "rgba(214,211,209,0.6)",
    spot: "rgba(214,211,209,0.08)",
    hairline:
      "bg-gradient-to-r from-transparent via-stone-400/50 to-transparent",
    heroTint: "from-stone-500/15 via-stone-900/60",
    edge: "border-t-2 border-t-stone-400/50",
    pill: "border border-stone-400/30 bg-stone-500/10 text-stone-200",
    pillHover: "hover:bg-stone-500/20",
    pageGlow:
      "bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(120,113,108,0.14),transparent)]",
  },
};

// ── Theme builders ────────────────────────────────────────────────────
// Theme supplies layout/typography; accent fragments supply color.

// ── Regression anchor: exact current presentation ──────────────────
const classicTheme = (a: LightAccent): CardThemeTokens => ({
  page: `bg-gradient-to-b ${a.pageTint} via-stone-50 to-stone-50`,
  card: "rounded-2xl border border-stone-200 bg-white shadow-sm",
  h1: "mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl",
  headline: "mt-2 text-lg leading-relaxed font-medium text-stone-600",
  body: "text-stone-600",
  strong: "text-stone-900",
  subtle: "text-stone-600",
  faint: "text-stone-500",
  innerCard: "rounded-xl border border-stone-200 bg-stone-50/50",
  meta: "text-xs font-semibold tracking-widest text-stone-500 uppercase",
  h2: "text-xl font-bold tracking-tight text-stone-900",
  accent: a.text,
  accentIcon: a.text,
  accentMeta: `text-xs font-semibold tracking-widest ${a.text} uppercase`,
  button: `rounded-xl ${a.cta} px-5 py-2.5 text-sm font-semibold transition-colors ${a.ctaHover}`,
  avatar: `grid size-24 place-items-center rounded-full ${a.cta} text-3xl font-bold ring-8 ${a.ringSoft}`,
  avatarImg: `size-24 rounded-full object-cover ring-8 ${a.ringSoft}`,
  coverWrap: "relative h-40 w-full sm:h-48",
  coverOverlay: "",
  coverAvatarPull: "-mt-14 sm:-mt-16",
  openBadge: `inline-flex items-center gap-1.5 rounded-full border ${a.borderSoft} ${a.softBg} px-3 py-1 text-xs font-semibold ${a.textStrong}`,
  factsPanel: "rounded-xl border border-stone-100 bg-stone-50/70 p-5",
  factLabel: "text-xs font-medium text-stone-400",
  factValue: "mt-0.5 text-sm font-semibold text-stone-800",
  chip: "rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600",
  skillChip: `rounded-full border ${a.borderSofter} ${a.softBgSoft} px-3 py-1 text-xs font-medium text-stone-700`,
  timelineDot: a.dot,
  timelineLine: a.line,
  socialBtn: `border-stone-200 text-stone-500 ${a.hoverBorder} ${a.hoverText}`,
  link: `text-xs font-semibold ${a.text} ${a.textHover}`,
  footer: "text-stone-400",
  footerBrand: a.cta,
});

// ── Structured, professional, white-dominant ───────────────────────
const corporateTheme = (a: LightAccent): CardThemeTokens => ({
  page: "bg-stone-100",
  card: "rounded-lg border border-stone-200 bg-white",
  h1: "mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl",
  headline: "mt-2 text-base leading-relaxed font-medium text-stone-500",
  body: "text-stone-600",
  strong: "text-stone-900",
  subtle: "text-stone-500",
  faint: "text-stone-400",
  innerCard: "rounded-md border border-stone-200 bg-stone-50",
  meta: "text-[11px] font-semibold tracking-[0.16em] text-stone-400 uppercase",
  h2: "text-lg font-semibold tracking-tight text-stone-900",
  accent: a.textStrong,
  accentIcon: a.text,
  accentMeta: `text-[11px] font-semibold tracking-[0.16em] ${a.textStrong} uppercase`,
  button: `rounded-md ${a.ctaDeep} px-5 py-2.5 text-sm font-semibold transition-colors ${a.ctaDeepHover}`,
  avatar: `grid size-24 place-items-center rounded-md bg-stone-900 text-3xl font-semibold ${a.textAvatar} ring-4 ${a.ringDim}`,
  avatarImg: `size-24 rounded-md object-cover ring-4 ${a.ringDim}`,
  coverWrap: "relative h-24 w-full sm:h-28",
  coverOverlay: "",
  coverAvatarPull: "-mt-10",
  openBadge: `inline-flex items-center gap-1.5 rounded-md border ${a.borderMedDeep} ${a.softBg} px-3 py-1 text-xs font-semibold ${a.textBadge}`,
  factsPanel: `rounded-lg border-l-2 ${a.borderStrong} bg-stone-50 p-5`,
  factLabel:
    "text-[11px] font-semibold tracking-wider text-stone-400 uppercase",
  factValue: "mt-0.5 text-sm font-semibold text-stone-900",
  chip: "rounded-md border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600",
  skillChip: `rounded-md border ${a.borderSoftDeep} ${a.softBgSofter} px-3 py-1 text-xs font-medium text-stone-700`,
  timelineDot: a.dotDeep,
  timelineLine: "bg-stone-300/70",
  socialBtn: `border-stone-300 text-stone-500 ${a.hoverBorderDeep} ${a.hoverTextDeep}`,
  link: `text-xs font-semibold ${a.textStrong} ${a.textStrongHover}`,
  footer: "text-stone-400",
  footerBrand: a.ctaDeep,
});

// ── Compact technical clarity ──────────────────────────────────────
const techTheme = (a: LightAccent): CardThemeTokens => ({
  page: "bg-white",
  card: "rounded-lg border border-neutral-200 bg-white",
  h1: "mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl",
  headline: "mt-2 text-base leading-relaxed font-medium text-neutral-500",
  body: "text-neutral-600",
  strong: "text-neutral-900",
  subtle: "text-neutral-600",
  faint: "text-neutral-500",
  innerCard: "rounded-md border border-neutral-200 bg-neutral-50",
  meta: "font-mono text-[11px] font-medium tracking-[0.14em] text-neutral-400 uppercase",
  h2: "font-mono text-lg font-bold tracking-tight text-neutral-900",
  accent: a.text,
  accentIcon: a.text,
  accentMeta: `font-mono text-[11px] font-medium tracking-[0.14em] ${a.text} uppercase`,
  button: `rounded-md ${a.ctaMono} px-5 py-2.5 font-mono text-sm font-semibold transition-colors ${a.ctaMonoHover}`,
  avatar: `grid size-20 place-items-center rounded-lg bg-neutral-900 font-mono text-2xl font-bold ${a.textOnDark} ring-1 ring-neutral-200`,
  avatarImg: "size-20 rounded-lg object-cover ring-1 ring-neutral-200",
  coverWrap: "relative h-20 w-full sm:h-24",
  coverOverlay: "",
  coverAvatarPull: "-mt-10",
  openBadge: `inline-flex items-center gap-1.5 rounded-md border ${a.borderMed} ${a.softBg} px-3 py-1 font-mono text-xs font-medium ${a.textStrong}`,
  factsPanel: "rounded-lg border border-neutral-200 bg-neutral-50 p-5",
  factLabel: "font-mono text-[11px] font-medium text-neutral-400 uppercase",
  factValue: "mt-0.5 text-sm font-semibold text-neutral-900",
  chip: "rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-600",
  skillChip:
    "rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-700",
  timelineDot: a.dot,
  timelineLine: "bg-neutral-200",
  socialBtn:
    "border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900",
  link: `font-mono text-xs font-semibold ${a.text} ${a.textHover}`,
  footer: "text-neutral-400",
  footerBrand: `bg-neutral-900 ${a.textOnDark}`,
});

// ── Premium dark charcoal for leadership ───────────────────────────
const executiveTheme = (a: DarkAccent): CardThemeTokens => ({
  page: "bg-stone-950",
  card: "rounded-2xl border border-stone-800 bg-stone-900",
  h1: "mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl",
  headline: `mt-3 text-xl leading-relaxed font-medium ${a.headline}`,
  body: "text-stone-400",
  strong: "text-white",
  subtle: "text-stone-400",
  faint: "text-stone-500",
  innerCard: "rounded-xl border border-stone-800 bg-stone-950/40",
  meta: "text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase",
  h2: "text-2xl font-bold tracking-tight text-white",
  accent: a.text,
  accentIcon: a.text,
  accentMeta: `text-xs font-semibold tracking-[0.18em] ${a.text} uppercase`,
  button: `rounded-xl ${a.cta} px-5 py-2.5 text-sm font-semibold transition-colors ${a.ctaHover}`,
  avatar: `grid size-28 place-items-center rounded-full bg-gradient-to-br ${a.avatarGradFrom} ${a.avatarGradTo} text-4xl font-bold text-stone-950 ring-4 ring-stone-800`,
  avatarImg: `size-28 rounded-full object-cover ring-4 ${a.ring}`,
  coverWrap: "relative h-44 w-full sm:h-60",
  coverOverlay:
    "bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent",
  coverAvatarPull: "-mt-16 sm:-mt-20",
  openBadge: `inline-flex items-center gap-1.5 rounded-full border ${a.borderSoft} ${a.softBg} px-3 py-1 text-xs font-semibold ${a.textSoft}`,
  factsPanel: "rounded-xl border border-stone-800 bg-stone-950/60 p-5",
  factLabel: "text-xs font-medium text-stone-500",
  factValue: "mt-0.5 text-sm font-semibold text-stone-200",
  chip: "rounded-full border border-stone-700 bg-stone-800/60 px-3 py-1 text-xs font-medium text-stone-300",
  skillChip: `rounded-full border ${a.borderSofter} ${a.softBg} px-3 py-1 text-xs font-medium ${a.chipText}`,
  timelineDot: a.dot,
  timelineLine: "bg-stone-800",
  socialBtn: `border-stone-700 text-stone-400 ${a.hoverBorder} ${a.textHover}`,
  link: `text-xs font-semibold ${a.text} ${a.textHover}`,
  footer: "text-stone-600",
  footerBrand: a.footer,
});

const LIGHT_BUILDERS: Record<
  "role-race-classic" | "corporate-clean" | "tech-minimal",
  (a: LightAccent) => CardThemeTokens
> = {
  "role-race-classic": classicTheme,
  "corporate-clean": corporateTheme,
  "tech-minimal": techTheme,
};

/**
 * Resolve arbitrary stored ids to a full token set — never throws.
 * Unknown/unset accent falls back to Emerald (pre-7A4E appearance).
 */
export function cardTheme(
  themeId: unknown,
  accentId: unknown = "emerald",
): CardThemeTokens {
  const theme = resolveCareerCardTheme(themeId);
  const accent = resolveCareerCardAccent(accentId);
  return theme === "executive-dark"
    ? executiveTheme(DARK_ACCENTS[accent])
    : LIGHT_BUILDERS[theme](LIGHT_ACCENTS[accent]);
}

/**
 * Stage 7A4F1/7A4F3 — Premium Card Style (compact one-page).
 *
 * Premium is a presentation overlay: the same theme + accent token sets
 * are composed with a per-theme "premium" fragment. Standard resolves
 * `premium: null` and renders the pre-7A4F1 page verbatim.
 */
export interface CardStyleTokens {
  /** Premium page canvas (replaces t.page on <main>). */
  page: string;
  /** Premium content width constraint. */
  contentMax: string;
  /** Outer hero card. */
  heroCard: string;
  /** Cover frame height. */
  coverWrap: string;
  /** No-cover premium hero band — theme+accent tinted, never blank. */
  heroBand: string;
  /** Negative pull that overlaps the portrait over cover/band. */
  avatarPull: string;
  /** Initials avatar container. */
  avatar: string;
  /** Photo img frame. */
  avatarImg: string;
  /** Compact identity panel tucked under the portrait. */
  identityPanel: string;
  /** Compact stacked section card. */
  card: string;
  cardTitle: string;
  cardIcon: string;
  /** Inline expand/collapse toggle. */
  toggle: string;
  /** Labeled secondary action pill. */
  actionPill: string;
  actionPillHover: string;
  /** Full-width-on-mobile primary CTA. */
  primaryCta: string;
  /** Derived career-facts strip. */
  factsRow: string;
  factValue: string;
  factLabel: string;
  /** Skill / language chip. */
  chip: string;
  /** Card subtitle/descriptor line. */
  cardSub: string;
  /** Divider above expanded card detail. */
  detailBorder: string;
  /** Gradient that fades the cover into the hero surface. */
  coverShade: string;
  /** Card top accent hairline (empty = no hairline). */
  cardGlow: string;
  /** Identity-panel top accent hairline (empty = no hairline). */
  panelGlow: string;
  /** Border-Beam color on the primary CTA (accent rgba). */
  beam: string;
  /** Magic-Card spotlight color (accent rgba). */
  spot: string;
}

type AccentForPremium = Pick<
  DarkAccent,
  "ringAccent" | "heroTint" | "edge" | "pill" | "pillHover" | "cta"
> & {
  pageGlow?: string;
  ctaGlow: string;
  beam: string;
  spot: string;
  hairline: string;
};

function premiumLight(
  t: CardThemeTokens,
  a: AccentForPremium,
  opts: {
    radius: string;
    cardRadius: string;
    edge: string;
    heroCard: string;
    page: string;
    avatarRadius: string;
    mono?: boolean;
  },
): CardStyleTokens {
  const avatarSz = `size-28 sm:size-32 ${opts.avatarRadius}`;
  const mono = opts.mono ? "font-mono " : "";
  return {
    page: opts.page,
    contentMax: "max-w-[980px]",
    heroCard: opts.heroCard,
    coverWrap: "relative z-0 h-40 w-full overflow-hidden sm:h-52 lg:h-60",
    coverShade: "bg-gradient-to-t from-black/10 to-transparent",
    heroBand: `h-28 w-full bg-gradient-to-b ${a.heroTint} to-transparent sm:h-32`,
    avatarPull: "-mt-10 sm:-mt-16",
    avatar: `grid ${avatarSz} place-items-center ${a.cta} text-3xl font-bold ${a.ringAccent} shadow-lg`,
    avatarImg: `${avatarSz} object-cover ${a.ringAccent} shadow-lg`,
    identityPanel: `relative z-20 -mt-8 w-full max-w-2xl ${opts.radius} border border-stone-200 bg-white px-4 pt-11 pb-5 text-center shadow-xl shadow-stone-900/10 sm:-mt-10 sm:px-8 sm:pt-14`,
    card: `${opts.cardRadius} border ${opts.edge} bg-white p-4 shadow-sm sm:p-5`,
    cardTitle: `${mono}text-base font-semibold ${t.strong}`,
    cardIcon: `mt-0.5 grid size-10 shrink-0 place-items-center ${opts.cardRadius} ${a.pill} shadow-sm`,
    toggle: `${mono}flex shrink-0 flex-col items-center gap-0.5 self-center rounded-md px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400`,
    actionPill: `${mono}inline-flex min-h-10 items-center gap-2 ${opts.mono ? "rounded-md" : "rounded-full"} ${a.pill} px-3.5 text-sm font-medium transition-colors`,
    actionPillHover: a.pillHover,
    primaryCta: `w-full justify-center sm:w-auto ${a.ctaGlow}`,
    factsRow: `mt-4 flex justify-center divide-x divide-stone-200 border-t border-stone-200 pt-4`,
    factValue: `${mono}text-xl font-bold leading-none ${t.accent}`,
    factLabel: `${mono}mt-1.5 text-[10px] font-medium tracking-[0.14em] uppercase ${t.faint}`,
    chip: t.skillChip,
    cardSub: `mt-0.5 text-sm leading-relaxed ${t.subtle}`,
    detailBorder: `mt-3 border-t border-stone-200 pt-3`,
    cardGlow: "",
    panelGlow: "",
    beam: a.beam,
    spot: a.spot,
  };
}

function premiumExecutive(
  t: CardThemeTokens,
  a: AccentForPremium,
): CardStyleTokens {
  return {
    page: `bg-stone-950 ${a.pageGlow ?? ""}`,
    contentMax: "max-w-[980px]",
    heroCard:
      "overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 shadow-xl",
    coverWrap: "relative z-0 h-40 w-full overflow-hidden sm:h-56 lg:h-64",
    coverShade:
      "bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent",
    heroBand: `h-28 w-full bg-gradient-to-b ${a.heroTint} to-transparent sm:h-36`,
    avatarPull: "-mt-10 sm:-mt-16 lg:-mt-20",
    avatar: `grid size-28 place-items-center rounded-full sm:size-32 lg:size-36 ${a.cta} text-3xl font-bold ${a.ringAccent} shadow-xl sm:text-4xl`,
    avatarImg: `size-28 rounded-full object-cover sm:size-32 lg:size-36 ${a.ringAccent} shadow-xl`,
    identityPanel:
      "relative z-20 -mt-8 w-full max-w-2xl rounded-2xl border border-stone-700/80 bg-stone-950/80 px-4 pt-11 pb-5 text-center shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md sm:-mt-10 sm:px-8 sm:pt-14",
    card: `rounded-xl border border-stone-800 bg-gradient-to-b from-stone-900/90 to-stone-950/95 p-4 shadow-lg shadow-black/30 sm:p-5`,
    cardTitle: `text-[15px] font-bold ${t.strong}`,
    cardIcon: `mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg ${a.pill} shadow-sm`,
    toggle: `flex shrink-0 flex-col items-center gap-0.5 self-center rounded-md px-2 py-1 text-[11px] font-medium text-stone-400 hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500`,
    actionPill: `inline-flex min-h-10 items-center gap-2 rounded-full ${a.pill} px-3.5 text-sm font-medium transition-colors`,
    actionPillHover: a.pillHover,
    primaryCta: `w-full justify-center sm:w-auto ${a.ctaGlow}`,
    factsRow:
      "mt-4 flex justify-center divide-x divide-stone-800 border-t border-stone-800 pt-4",
    factValue: `text-xl font-bold leading-none ${t.accent}`,
    factLabel: `mt-1.5 text-[10px] font-medium tracking-[0.14em] uppercase ${t.faint}`,
    chip: t.skillChip,
    cardSub: `mt-0.5 text-sm leading-relaxed ${t.subtle}`,
    detailBorder: `mt-3 border-t border-stone-800 pt-3`,
    cardGlow: a.hairline,
    panelGlow: a.hairline,
    beam: a.beam,
    spot: a.spot,
  };
}

export type CardStyleTokensOrNull = CardStyleTokens | null;

/**
 * Resolve theme + accent + style to the composed token pair. Standard
 * (or any unknown style) → premium: null.
 */
export function cardStyleTokens(
  themeId: unknown,
  accentId: unknown,
  styleId: unknown,
): { base: CardThemeTokens; premium: CardStyleTokensOrNull } {
  const theme = resolveCareerCardTheme(themeId);
  const accent = resolveCareerCardAccent(accentId);
  const base = cardTheme(theme, accent);
  if (resolveCareerCardStyle(styleId) !== "premium") {
    return { base, premium: null };
  }
  const a =
    theme === "executive-dark" ? DARK_ACCENTS[accent] : LIGHT_ACCENTS[accent];
  const premium =
    theme === "executive-dark"
      ? premiumExecutive(base, a)
      : theme === "corporate-clean"
        ? premiumLight(base, a, {
            radius: "rounded-lg",
            cardRadius: "rounded-lg",
            edge: "border-stone-200 border-l-2 border-l-stone-400",
            heroCard:
              "overflow-hidden rounded-lg border border-stone-200 bg-white shadow-md",
            page: `bg-gradient-to-b ${a.heroTint} via-stone-100 to-stone-100`,
            avatarRadius: "rounded-2xl",
          })
        : theme === "tech-minimal"
          ? premiumLight(base, a, {
              radius: "rounded-lg",
              cardRadius: "rounded-lg",
              edge: `border-neutral-200 ${a.edge}`,
              heroCard:
                "overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg",
              page: "bg-neutral-100 bg-[radial-gradient(rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:22px_22px]",
              avatarRadius: "rounded-lg",
              mono: true,
            })
          : premiumLight(base, a, {
              radius: "rounded-2xl",
              cardRadius: "rounded-xl",
              edge: `border-stone-200 ${a.edge}`,
              heroCard:
                "overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg",
              page: `bg-gradient-to-b ${a.heroTint} via-stone-50 to-stone-100`,
              avatarRadius: "rounded-full",
            });
  return { base, premium };
}
