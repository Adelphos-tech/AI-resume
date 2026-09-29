import type { ReactNode } from "react";

/** Horizontal row of career facts, optionally divided. */
export function StatRail({
  children,
  divided = false,
  dividerClassName = "divide-stone-700/60",
  className = "",
}: {
  children: ReactNode;
  divided?: boolean;
  dividerClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`grid auto-cols-fr grid-flow-col items-center ${
        divided ? `divide-x ${dividerClassName}` : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
