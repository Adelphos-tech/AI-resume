"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { MagicCard } from "@/components/dev-lab/lab-effects";

/**
 * Dev-lab section card — collapsed premium anatomy:
 * accent icon tile | title + subtitle | right-side chevron toggle.
 * Expanded detail renders inside the same card below a divider.
 * Desktop pointer gets a subtle MagicCard spotlight; mobile is static.
 */
export function LabCard({
  title,
  icon,
  sub,
  detail,
  moreLabel,
  delay = 0,
}: {
  title: string;
  icon: ReactNode;
  sub: ReactNode;
  detail?: ReactNode;
  moreLabel?: string;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const pid = useId();
  const body = (
    <section className="relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-b from-stone-900/90 to-stone-950/95 p-4 shadow-lg shadow-black/30">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
      />
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-sm"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-white">{title}</h2>
          <div className="mt-0.5 text-sm leading-relaxed text-stone-400">
            {sub}
          </div>
        </div>
        {detail !== undefined && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={pid}
            onClick={() => setOpen((v) => !v)}
            className="flex shrink-0 flex-col items-center gap-0.5 self-center rounded-md px-2 py-1 text-[11px] font-medium text-stone-400 hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            <span className="whitespace-nowrap">
              {open ? "Show less" : (moreLabel ?? "Show more")}
            </span>
            <ChevronDown
              aria-hidden
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {detail !== undefined && (
        <div
          id={pid}
          hidden={!open}
          className="mt-3 border-t border-stone-800 pt-3"
        >
          {detail}
        </div>
      )}
    </section>
  );
  return (
    <div className="lab-fade" style={{ "--lab-delay": `${delay}s` } as never}>
      <MagicCard className="h-full">{body}</MagicCard>
    </div>
  );
}
