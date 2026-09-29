"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/**
 * Premium compact section card with optional inline expansion.
 * Static cards render no toggle; the right-side chevron appears only when
 * `detail` exists (i.e. the card is actually interactive). Expansion stays
 * on the same page and exposes aria-expanded/aria-controls.
 */
export function CompactCard({
  id,
  title,
  icon,
  cardClassName,
  titleClassName,
  iconClassName,
  toggleClassName,
  subClassName,
  detailClassName,
  summary,
  detail,
  moreLabel,
  lessLabel = "Show less",
}: {
  id: string;
  title: string;
  icon: ReactNode;
  cardClassName: string;
  titleClassName: string;
  iconClassName: string;
  toggleClassName: string;
  subClassName: string;
  detailClassName: string;
  summary: ReactNode;
  detail?: ReactNode;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section aria-labelledby={id} className={cardClassName}>
      <div className="flex items-center gap-3">
        <span aria-hidden className={iconClassName}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={id} className={titleClassName}>
            {title}
          </h2>
          <div className={subClassName}>{summary}</div>
        </div>
        {detail !== undefined && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? lessLabel : (moreLabel ?? "Show more")} — ${title}`}
            onClick={() => setOpen((v) => !v)}
            className={toggleClassName}
          >
            <span className="whitespace-nowrap">
              {open ? lessLabel : (moreLabel ?? "Show more")}
            </span>
            <ChevronDown
              aria-hidden
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {detail !== undefined && (
        <div id={panelId} hidden={!open} className={detailClassName}>
          {detail}
        </div>
      )}
    </section>
  );
}
