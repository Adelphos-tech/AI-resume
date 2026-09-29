"use client";

import { ChevronDown } from "lucide-react";
import {
  useId,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

/**
 * Premium compact section card with optional inline expansion.
 * Static cards render no toggle; the right-side chevron appears only when
 * `detail` exists (i.e. the card is actually interactive). Expansion stays
 * on the same page and exposes aria-expanded/aria-controls.
 * `spotColor` enables the accent Magic-Card spotlight on pointer devices.
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
  edgeClassName,
  spotColor,
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
  /** Top accent hairline gradient (rendered inside the card edge). */
  edgeClassName?: string;
  /** Magic-Card spotlight rgba; undefined = no pointer effect. */
  spotColor?: string;
  summary: ReactNode;
  detail?: ReactNode;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--pm-mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--pm-my", `${e.clientY - r.top}px`);
  };
  return (
    <section
      aria-labelledby={id}
      onPointerMove={spotColor ? onPointerMove : undefined}
      className={`${cardClassName}${
        edgeClassName || spotColor ? " relative" : ""
      }${edgeClassName ? " overflow-hidden" : ""}${
        spotColor ? " pm-magic" : ""
      }`}
      style={
        spotColor
          ? ({ "--pm-spot-color": spotColor } as CSSProperties)
          : undefined
      }
    >
      {edgeClassName && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-px ${edgeClassName}`}
        />
      )}
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
