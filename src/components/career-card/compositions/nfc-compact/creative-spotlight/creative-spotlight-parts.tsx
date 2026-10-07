"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import type { DualProfileActive } from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";

/* ── Shared parts for the Creative Spotlight skin ── */

/** Segmented switch: Celebrity | Production Company */
export function CreativeSpotlightSwitch({
  value,
  onChange,
}: {
  value: DualProfileActive;
  onChange: (v: DualProfileActive) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Profile switch"
      className="mx-auto flex w-full max-w-[22rem] rounded-full bg-stone-100 p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "candidate"}
        onClick={() => onChange("candidate")}
        className={`flex-1 rounded-full py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
          value === "candidate"
            ? "bg-[var(--nfc-cta)] text-white shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Celebrity
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "company"}
        onClick={() => onChange("company")}
        className={`flex-1 rounded-full py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
          value === "company"
            ? "bg-[var(--nfc-cta)] text-white shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Production Company
      </button>
    </div>
  );
}

/** Social action tile — circular with brand color background. */
export function CreativeSpotlightSocialTile({
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
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-[var(--nfc-cta)]/10 hover:text-[var(--nfc-strong)]"
    >
      {children}
    </a>
  );
}

/** Section with icon + label heading. */
export function CreativeSpotlightSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-[var(--nfc-strong)]">{icon}</span>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </p>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Mini info card for Education, Experience, Certifications, Industry, Locations, Services. */
export function CreativeSpotlightMiniCard({
  icon,
  label,
  lines,
}: {
  icon: ReactNode;
  label: string;
  lines: (string | null | undefined)[];
}) {
  const visible = lines.filter((l): l is string => !!l);
  if (visible.length === 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-stone-200/70 bg-white/60 p-4 backdrop-blur-sm">
      <span className="mt-0.5 text-[var(--nfc-strong)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {label}
        </p>
        {visible.map((line, i) => (
          <p key={i} className="text-xs font-semibold text-stone-800">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Action card with icon, label, description, and optional href. */
export function CreativeSpotlightActionCard({
  icon,
  label,
  description,
  href,
}: {
  icon: ReactNode;
  label: string;
  description?: string | null;
  href?: string | null;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white/60 p-4 backdrop-blur-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
          {label}
        </p>
        {description && (
          <p className="mt-0.5 truncate text-[11px] text-stone-500">
            {description}
          </p>
        )}
      </div>
      {href && <ExternalLink className="size-3.5 shrink-0 text-stone-400" />}
    </div>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block transition hover:opacity-90"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

/** Category / genre chip. */
export function CreativeSpotlightChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--nfc-cta)]/20 bg-[var(--nfc-cta)]/5 px-3 py-1 text-[11px] font-semibold text-[var(--nfc-strong)]">
      {label}
    </span>
  );
}
