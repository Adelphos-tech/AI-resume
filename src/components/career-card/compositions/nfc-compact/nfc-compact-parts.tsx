import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Shared pieces for the NFC Compact (Dual Profile) template lab. */

/** Card with icon tile + label + body — matches the reference cards. */
export function CompactSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/70 border-l-[3px] border-l-[var(--nfc-cta)] bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-blue-950">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Borderless group heading — used where chips/rows carry the structure. */
export function CompactPlainHeading({
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
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950">
        {label}
      </h3>
    </div>
  );
}

/** Three-up mini information card — Education/Experience/Certs, Industry/… */
export function CompactMiniCard({
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
    <div className="relative min-w-0 rounded-xl border border-stone-200/70 bg-white p-3.5">
      {/* credential corner mark */}
      <span
        aria-hidden
        className="absolute top-2 right-2 grid grid-cols-2 gap-0.5 opacity-40"
      >
        <span className="size-1 rounded-[1px] bg-[var(--nfc-cta)]" />
        <span className="size-1 rounded-[1px] bg-stone-300" />
        <span className="size-1 rounded-[1px] bg-stone-300" />
        <span className="size-1 rounded-[1px] bg-[var(--nfc-cta)]" />
      </span>
      {/* mobile: compact horizontal row — icon left, label+values stacked right;
          sm+: same card in the approved 3-column grid */}
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
                    ? "text-xs font-semibold leading-snug text-blue-950"
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
export function CompactActionCard({
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
    "group flex w-full items-center gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 text-left transition hover:border-[var(--nfc-cta)]/40 hover:ring-2 hover:ring-[var(--nfc-cta)]/15";
  const inner = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-blue-950">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">
          {description}
        </p>
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-[var(--nfc-strong)]/50"
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

/** Segmented Candidate / Company switch. */
export function ProfileSwitch({
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
      className="mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-stone-100 p-1 ring-1 ring-stone-200/60"
    >
      {(["candidate", "company"] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full py-1.5 text-sm font-semibold transition ${
            value === id
              ? "bg-[var(--nfc-cta)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {id === "candidate" ? "Candidate" : "Company"}
        </button>
      ))}
    </div>
  );
}

/** Social round tiles — LinkedIn/GitHub/Website. */
export function SocialTile({
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
      className="grid size-8 place-items-center rounded-full bg-[var(--nfc-cta)] text-white transition hover:bg-[var(--nfc-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)]"
    >
      {children}
    </a>
  );
}

/** Compact contact row — icon + value. */
export function ContactRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-blue-950">
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)] [&>svg]:size-2.5">
        {icon}
      </span>
      {value}
    </p>
  );
}
