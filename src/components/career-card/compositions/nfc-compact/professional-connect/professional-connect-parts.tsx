import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Shared presentation primitives for the Professional Connect skin. */

/** Layered surface shadow — softer, deeper than shadow-sm. */
export const PROFCONN_CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_24px_-12px_rgba(30,58,138,0.14)]";

/** Segmented Candidate / Company switch — pill style with accent selection. */
export function ProfessionalConnectSwitch({
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
      className="pm-fade mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200/60"
      style={{ "--pm-delay": "0.1s" } as CSSProperties}
    >
      {(["candidate", "company"] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)] ${
            value === id
              ? "bg-[var(--nfc-cta)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_-4px_var(--nfc-cta)]"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {id === "candidate" ? "Candidate" : "Company"}
        </button>
      ))}
    </div>
  );
}

/** Section card with icon, label, and children — investor-style elevated card. */
export function ProfessionalConnectSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/70 bg-white p-4 ${PROFCONN_CARD_SHADOW}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Borderless group heading. */
export function ProfessionalConnectPlainHeading({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)] [&>svg]:size-3.5">
        {icon}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
        {label}
      </h3>
    </div>
  );
}

/** Three-up mini information card. */
export function ProfessionalConnectMiniCard({
  icon,
  label,
  lines,
}: {
  icon: ReactNode;
  label: string;
  lines: (string | null | undefined)[];
}) {
  const flexDir = useResponsiveClasses(
    "flex items-center gap-3",
    "flex-col items-start gap-2.5",
    "flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2.5",
  );
  const items = lines.filter(Boolean) as string[];
  if (!items.length) return null;
  return (
    <div
      className={`relative min-w-0 rounded-xl border border-slate-200/70 bg-white p-3.5 ${PROFCONN_CARD_SHADOW}`}
    >
      <div className={`w-full min-w-0 ${flexDir}`}>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-normal break-normal hyphens-none text-[10px] font-bold uppercase tracking-wider text-[var(--nfc-strong)]/60">
            {label}
          </p>
          <div className="mt-1 space-y-0.5">
            {items.map((l, i) => (
              <p
                key={i}
                className={
                  "break-normal hyphens-none " +
                  (i === 0
                    ? "text-xs font-semibold leading-snug text-slate-900"
                    : "text-[11px] leading-snug text-slate-500")
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
export function ProfessionalConnectActionCard({
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
  const cls = `group flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--nfc-cta)]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)] ${PROFCONN_CARD_SHADOW}`;
  const inner = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">
          {description}
        </p>
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-[var(--nfc-strong)]/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--nfc-strong)]"
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

/** Social round tiles — LinkedIn/GitHub/Website etc. */
export function ProfessionalConnectSocialTile({
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
      className="grid size-9 place-items-center rounded-full bg-[var(--nfc-cta)] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:bg-[var(--nfc-cta-hover)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)] active:scale-95"
    >
      {children}
    </a>
  );
}

/** Compact contact row — icon + value. */
export function ProfessionalConnectContactRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)] [&>svg]:size-2.5">
        {icon}
      </span>
      {value}
    </p>
  );
}
