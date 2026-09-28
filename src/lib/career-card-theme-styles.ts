import {
  resolveCareerCardTheme,
  type CareerCardThemeId,
} from "@/lib/career-card-themes";

/**
 * Presentation tokens per Career Card theme. These are trusted,
 * application-authored class bundles keyed by theme id — never derived
 * from user input. role-race-classic intentionally reproduces the
 * original presentation exactly.
 */
export type CardThemeTokens = {
  /** Page background. */
  page: string;
  /** Section card shell. */
  card: string;
  /** Hero name. */
  h1: string;
  /** Hero headline. */
  headline: string;
  /** Body copy. */
  body: string;
  /** Primary text (names, positions, institutions). */
  strong: string;
  /** Secondary text (companies, dates). */
  subtle: string;
  /** Faint text (timestamps, small captions). */
  faint: string;
  /** Inner nested card (project tiles). */
  innerCard: string;
  /** Small uppercase meta labels. */
  meta: string;
  /** Section headings. */
  h2: string;
  /** Accent text (eyebrow labels, links). */
  accent: string;
  /** Accent icon color. */
  accentIcon: string;
  /** Primary CTA button. */
  button: string;
  /** Avatar/initials circle. */
  avatar: string;
  /** Hero avatar photo <img> — object-cover, centered; shape matches theme. */
  avatarImg: string;
  /** "Open to opportunities" badge. */
  openBadge: string;
  /** Career facts aside. */
  factsPanel: string;
  factLabel: string;
  factValue: string;
  /** Small pills (languages, project tags, resume meta). */
  chip: string;
  /** Keyword chips under skills. */
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

const THEMES: Record<CareerCardThemeId, CardThemeTokens> = {
  // ── Regression anchor: exact current presentation ──────────────────
  "role-race-classic": {
    page: "bg-gradient-to-b from-emerald-50/60 via-stone-50 to-stone-50",
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
    accent: "text-emerald-700",
    accentIcon: "text-emerald-700",
    button:
      "rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800",
    avatar:
      "grid size-24 place-items-center rounded-full bg-emerald-700 text-3xl font-bold text-white ring-8 ring-emerald-50",
    avatarImg: "size-24 rounded-full object-cover ring-8 ring-emerald-50",
    openBadge:
      "inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800",
    factsPanel: "rounded-xl border border-stone-100 bg-stone-50/70 p-5",
    factLabel: "text-xs font-medium text-stone-400",
    factValue: "mt-0.5 text-sm font-semibold text-stone-800",
    chip: "rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600",
    skillChip:
      "rounded-full border border-emerald-600/20 bg-emerald-50/50 px-3 py-1 text-xs font-medium text-stone-700",
    timelineDot: "bg-emerald-600",
    timelineLine: "bg-emerald-600/15",
    socialBtn:
      "border-stone-200 text-stone-500 hover:border-emerald-600/40 hover:text-emerald-700",
    link: "text-xs font-semibold text-emerald-700 hover:text-emerald-800",
    footer: "text-stone-400",
    footerBrand: "bg-emerald-700 text-white",
  },
  // ── Structured, professional, white-dominant ───────────────────────
  "corporate-clean": {
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
    accent: "text-emerald-800",
    accentIcon: "text-emerald-700",
    button:
      "rounded-md bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900",
    avatar:
      "grid size-24 place-items-center rounded-md bg-stone-900 text-3xl font-semibold text-emerald-100 ring-4 ring-emerald-700/15",
    avatarImg: "size-24 rounded-md object-cover ring-4 ring-emerald-700/15",
    openBadge:
      "inline-flex items-center gap-1.5 rounded-md border border-emerald-700/30 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900",
    factsPanel: "rounded-lg border-l-2 border-emerald-700/50 bg-stone-50 p-5",
    factLabel:
      "text-[11px] font-semibold tracking-wider text-stone-400 uppercase",
    factValue: "mt-0.5 text-sm font-semibold text-stone-900",
    chip: "rounded-md border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600",
    skillChip:
      "rounded-md border border-emerald-800/20 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-stone-700",
    timelineDot: "bg-emerald-800",
    timelineLine: "bg-stone-300/70",
    socialBtn:
      "border-stone-300 text-stone-500 hover:border-emerald-700/50 hover:text-emerald-800",
    link: "text-xs font-semibold text-emerald-800 hover:text-emerald-900",
    footer: "text-stone-400",
    footerBrand: "bg-emerald-800 text-white",
  },
  // ── Premium dark charcoal for leadership ───────────────────────────
  "executive-dark": {
    page: "bg-stone-950",
    card: "rounded-2xl border border-stone-800 bg-stone-900",
    h1: "mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl",
    headline: "mt-3 text-xl leading-relaxed font-medium text-emerald-300/90",
    body: "text-stone-400",
    strong: "text-white",
    subtle: "text-stone-400",
    faint: "text-stone-500",
    innerCard: "rounded-xl border border-stone-800 bg-stone-950/40",
    meta: "text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase",
    h2: "text-2xl font-bold tracking-tight text-white",
    accent: "text-emerald-400",
    accentIcon: "text-emerald-400",
    button:
      "rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-emerald-400",
    avatar:
      "grid size-28 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-4xl font-bold text-stone-950 ring-4 ring-stone-800",
    avatarImg: "size-28 rounded-full object-cover ring-4 ring-emerald-400/25",
    openBadge:
      "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300",
    factsPanel: "rounded-xl border border-stone-800 bg-stone-950/60 p-5",
    factLabel: "text-xs font-medium text-stone-500",
    factValue: "mt-0.5 text-sm font-semibold text-stone-200",
    chip: "rounded-full border border-stone-700 bg-stone-800/60 px-3 py-1 text-xs font-medium text-stone-300",
    skillChip:
      "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200",
    timelineDot: "bg-emerald-500",
    timelineLine: "bg-stone-800",
    socialBtn:
      "border-stone-700 text-stone-400 hover:border-emerald-500/50 hover:text-emerald-300",
    link: "text-xs font-semibold text-emerald-400 hover:text-emerald-300",
    footer: "text-stone-600",
    footerBrand: "bg-emerald-500 text-stone-950",
  },
  // ── Compact technical clarity ──────────────────────────────────────
  "tech-minimal": {
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
    accent: "text-emerald-700",
    accentIcon: "text-emerald-700",
    button:
      "rounded-md bg-neutral-900 px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-neutral-700",
    avatar:
      "grid size-20 place-items-center rounded-lg bg-neutral-900 font-mono text-2xl font-bold text-emerald-400 ring-1 ring-neutral-200",
    avatarImg: "size-20 rounded-lg object-cover ring-1 ring-neutral-200",
    openBadge:
      "inline-flex items-center gap-1.5 rounded-md border border-emerald-600/30 bg-emerald-50 px-3 py-1 font-mono text-xs font-medium text-emerald-800",
    factsPanel: "rounded-lg border border-neutral-200 bg-neutral-50 p-5",
    factLabel: "font-mono text-[11px] font-medium text-neutral-400 uppercase",
    factValue: "mt-0.5 text-sm font-semibold text-neutral-900",
    chip: "rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-600",
    skillChip:
      "rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-700",
    timelineDot: "bg-emerald-600",
    timelineLine: "bg-neutral-200",
    socialBtn:
      "border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900",
    link: "font-mono text-xs font-semibold text-emerald-700 hover:text-emerald-800",
    footer: "text-neutral-400",
    footerBrand: "bg-neutral-900 text-emerald-400",
  },
};

/** Resolve an arbitrary stored id to a full token set — never throws. */
export function cardTheme(themeId: unknown): CardThemeTokens {
  return THEMES[resolveCareerCardTheme(themeId)];
}
