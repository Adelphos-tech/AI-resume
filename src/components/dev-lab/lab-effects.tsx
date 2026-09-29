"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Dev-lab only — zero-dependency equivalents of Magic UI effects.
 * All animations are CSS-keyframes driven; reduced-motion is handled by
 * the `.lab-motion` media rules injected by the lab page, not JS.
 */

/** Magic UI "Blur Fade" — one-time entrance: opacity + blur + small rise. */
export function BlurFade({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** seconds */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`lab-fade ${className}`}
      style={{ "--lab-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Magic UI "Border Beam" — a single accent beam travelling the element
 * border via `offset-path`. Wrap a relatively-positioned element; the
 * beam is absolutely positioned and non-interactive. `duration` in
 * seconds, kept slow (8–14s) per spec.
 */
export function BorderBeam({
  size = 90,
  duration = 12,
  colorFrom = "rgba(167,139,250,0)",
  colorTo = "rgba(167,139,250,0.9)",
}: {
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  return (
    <div
      aria-hidden
      className="lab-beam"
      style={
        {
          "--lab-beam-size": `${size}px`,
          "--lab-beam-duration": `${duration}s`,
          "--lab-beam-from": colorFrom,
          "--lab-beam-to": colorTo,
        } as CSSProperties
      }
    />
  );
}

/**
 * Magic UI "Magic Card" — cursor-following accent spotlight + border
 * tint driven entirely by CSS custom properties (no React state, no
 * rerenders). Desktop pointer only; mobile renders a static card.
 */
export function MagicCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`lab-magic ${className}`}
      onPointerMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--lab-mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--lab-my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
