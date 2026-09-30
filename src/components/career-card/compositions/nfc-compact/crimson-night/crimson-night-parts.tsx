import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Crimson Night — dark skin for the NFC Compact / Dual Profile
 * composition. Dev-lab first; NOT wired into production theme selection.
 *
 * Skin tokens are CSS custom properties scoped to the card root. Every
 * part reads `var(--cn-*)`, so a future dark skin (e.g. Obsidian Gold)
 * only needs a different token map — never a new composition.
 *
 * Accent vs skin: the Career Card accent registry stays orthogonal —
 * Crimson Night is a whole-surface skin, `red` remains a light-skin accent.
 */
export const CRIMSON_NIGHT_VARS = {
  "--cn-cta": "#B91C1C",
  "--cn-cta-hover": "#991B1B",
  "--cn-hi": "#EF4444",
  "--cn-deep": "#7F1D1D",
  "--cn-base": "#09090B",
  "--cn-surface": "#121214",
  "--cn-elev": "#17171A",
  "--cn-raise": "#1C1C1F",
  "--cn-text": "#FAFAF9",
  "--cn-muted": "#A1A1AA",
  "--cn-faint": "#71717A",
  "--cn-border": "rgba(255,255,255,0.08)",
  "--cn-border-strong": "rgba(255,255,255,0.14)",
} as CSSProperties;

/** Section panel — elevated dark surface with a restrained crimson edge. */
export function CrimsonSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 border-l-[3px] border-l-[var(--cn-cta)] bg-[var(--cn-elev)] p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--cn-cta)]/15 text-[var(--cn-hi)]">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-[var(--cn-text)]">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Borderless group heading. */
export function CrimsonPlainHeading({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--cn-cta)]/15 text-[var(--cn-hi)] [&>svg]:size-3.5">
        {icon}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--cn-text)]">
        {label}
      </h3>
    </div>
  );
}

/** Mini credential card — mobile full-width row, sm+ 3-up. */
export function CrimsonMiniCard({
  icon,
  label,
  lines,
}: {
  icon: ReactNode;
  label: string;
  lines: (string | null | undefined)[];
}) {
  const items = lines.filter(Boolean) as string[];
  if (!items.length) return null;
  return (
    <div className="relative min-w-0 rounded-xl border border-white/10 bg-[var(--cn-elev)] p-3.5">
      {/* credential corner mark */}
      <span
        aria-hidden
        className="absolute top-2 right-2 grid grid-cols-2 gap-0.5 opacity-40"
      >
        <span className="size-1 rounded-[1px] bg-[var(--cn-cta)]" />
        <span className="size-1 rounded-[1px] bg-white/20" />
        <span className="size-1 rounded-[1px] bg-white/20" />
        <span className="size-1 rounded-[1px] bg-[var(--cn-cta)]" />
      </span>
      <div className="flex w-full min-w-0 items-center gap-3 sm:flex-col sm:items-start sm:gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--cn-cta)]/15 text-[var(--cn-hi)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-normal break-normal hyphens-none text-[10px] font-bold uppercase tracking-wider text-[var(--cn-faint)]">
            {label}
          </p>
          <div className="mt-1 space-y-0.5">
            {items.map((l, i) => (
              <p
                key={i}
                className={
                  "break-normal hyphens-none " +
                  (i === 0
                    ? "text-xs font-semibold leading-snug text-[var(--cn-text)]"
                    : "text-[11px] leading-snug text-[var(--cn-muted)]")
                }
              >
                {l}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wide action card — Portfolio/CV, Hiring, Company Profile. */
export function CrimsonActionCard({
  icon,
  label,
  description,
  href,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  href?: string | null;
}) {
  const cls =
    "group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[var(--cn-elev)] p-4 text-left transition hover:border-[var(--cn-cta)]/40 hover:ring-2 hover:ring-[var(--cn-cta)]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cn-hi)]";
  const inner = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--cn-cta)]/15 text-[var(--cn-hi)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[var(--cn-text)]">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-[var(--cn-muted)]">
          {description}
        </p>
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-[var(--cn-faint)] transition group-hover:text-[var(--cn-hi)]"
      />
    </>
  );
  if (!href) return <div className={cls}>{inner}</div>;
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

/** Segmented Candidate / Company switch — dark track, crimson selection. */
export function CrimsonSwitch({
  value,
  onChange,
}: {
  value: "candidate" | "company";
  onChange: (v: "candidate" | "company") => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Profile type"
      className="mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-[var(--cn-raise)] p-1 ring-1 ring-white/10"
    >
      {(["candidate", "company"] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full py-1.5 text-sm font-semibold transition ${
            value === id
              ? "bg-[var(--cn-cta)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              : "text-[var(--cn-faint)] hover:text-[var(--cn-muted)]"
          }`}
        >
          {id === "candidate" ? "Candidate" : "Company"}
        </button>
      ))}
    </div>
  );
}

/**
 * Social tiles — same shared brand glyphs, dark crimson-edged container.
 * Identical geometry/hover/focus contract as Career Passport Light.
 */
export function CrimsonSocialTile({
  href,
  label,
  children,
}: {
  href?: string | null;
  label: string;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label={label}
      className="grid size-8 place-items-center rounded-full border border-[var(--cn-border-strong)] bg-[var(--cn-raise)] text-[var(--cn-text)] transition hover:border-[var(--cn-cta)]/60 hover:bg-[var(--cn-cta)]/20 hover:text-[var(--cn-hi)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cn-hi)]"
    >
      {children}
    </a>
  );
}

/** Compact contact row — icon + value. */
export function CrimsonContactRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--cn-muted)]">
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--cn-cta)]/15 text-[var(--cn-hi)] [&>svg]:size-2.5">
        {icon}
      </span>
      {value}
    </p>
  );
}

/** Skill chip — charcoal chip, small crimson dot, warm-white text. */
export function CrimsonSkillChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--cn-raise)] px-2.5 py-1 text-[11px] font-semibold text-[var(--cn-muted)]">
      <span aria-hidden className="size-1.5 rounded-full bg-[var(--cn-cta)]" />
      {label}
    </span>
  );
}
