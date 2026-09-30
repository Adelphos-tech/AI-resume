import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

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
    <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white text-blue-900">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-blue-950">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </section>
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
  const items = lines.filter(Boolean) as string[];
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <span className="grid size-6 shrink-0 place-items-center rounded-md border border-sky-200 bg-white text-blue-900">
          {icon}
        </span>
        <p className="min-w-0 text-[10px] font-bold uppercase leading-tight tracking-wide text-blue-900/70">
          {label}
        </p>
      </div>
      <div className="mt-2.5 space-y-0.5">
        {items.map((l, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-xs font-semibold text-blue-950"
                : "text-[11px] leading-snug text-slate-500"
            }
          >
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Wide action card — Portfolio/CV, Hiring, Company Profile. */
export function CompactActionCard({
  icon,
  label,
  description,
}: {
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="group flex w-full items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white text-blue-900">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-blue-950">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">
          {description}
        </p>
      </div>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-blue-900/50" />
    </div>
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
      className="mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-sky-100 p-1"
    >
      {(["candidate", "company"] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full py-1.5 text-sm font-semibold transition ${
            value === id
              ? "bg-blue-900 text-white shadow-sm"
              : "text-blue-900/60"
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
      className="grid size-8 place-items-center rounded-full bg-blue-900 text-white"
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
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-blue-900 text-white [&>svg]:size-2.5">
        {icon}
      </span>
      {value}
    </p>
  );
}
