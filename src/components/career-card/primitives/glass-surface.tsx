import type { ReactNode } from "react";

/**
 * Generic glass-like surface primitive — translucent panel used by
 * compositions for identity/content regions. Geometry is the
 * composition's job; this only provides the surface mechanic.
 */
export function GlassSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
