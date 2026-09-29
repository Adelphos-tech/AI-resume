/**
 * Semantic Experience content — shared understanding of career-role data.
 * Compositions own geometry; these helpers own semantics.
 */
import type { DemoExperience } from "@/components/career-card/dev/demo-career-profile";

export type { DemoExperience };

/** "2018–2020", "2022—Now". */
export function formatRange(
  r: Pick<DemoExperience, "start" | "end" | "current">,
) {
  if (r.current) return `${r.start} — Now`;
  return r.end ? `${r.start}–${r.end}` : r.start;
}

/** Bullet list — semantic leaf; marker chrome comes from className. */
export function ExperienceBullets({
  items,
  className = "",
  itemClassName = "",
  markerClassName = "bg-stone-400",
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  markerClassName?: string;
}) {
  if (!items.length) return null;
  return (
    <ul className={className}>
      {items.map((h) => (
        <li key={h} className={`flex items-start gap-2 ${itemClassName}`}>
          <span
            aria-hidden
            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${markerClassName}`}
          />
          <span className="min-w-0">{h}</span>
        </li>
      ))}
    </ul>
  );
}
