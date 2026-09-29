"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Production Premium motion primitives — zero-dependency, accent-aware.
 * Visuals/timing are defined by the `pm-*` rules in globals.css;
 * reduced-motion degrades to fully static content.
 */

/** Blur Fade — one-time entrance: opacity + blur(6px) + translateY(8px). */
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
      className={`pm-fade ${className}`}
      style={{ "--pm-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Border Beam — one accent beam travelling the parent border.
 * Parent must be `relative overflow-hidden` with the beam as a child.
 */
export function BorderBeam({
  size = 70,
  duration = 10,
  color,
}: {
  size?: number;
  /** seconds — keep 8–14 */
  duration?: number;
  /** trusted rgba string from the accent registry */
  color: string;
}) {
  return (
    <div
      aria-hidden
      className="pm-beam"
      style={
        {
          "--pm-beam-size": `${size}px`,
          "--pm-beam-duration": `${duration}s`,
          "--pm-beam-color": color,
        } as CSSProperties
      }
    />
  );
}
