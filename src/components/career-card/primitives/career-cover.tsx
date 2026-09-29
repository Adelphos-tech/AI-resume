/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/**
 * Reusable Career Card cover primitive — non-destructive focal/zoom
 * rendering (object-position + scale, never cropped pixels).
 * Localized shade only where the composition needs text contrast.
 */

export type CareerCoverMode =
  "cinematic" | "banner" | "split" | "ambient" | "none";

const SHADES: Record<Exclude<CareerCoverMode, "none">, string> = {
  /** Protects the lower band where the identity panel meets the image. */
  cinematic:
    "absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent",
  /** Thin bottom fade for editorial strips. */
  banner:
    "absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent",
  /** Soft edge fade toward the identity column. */
  split:
    "absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/30 to-transparent",
  /** Light uniform tint — ambient usage (e.g. cell background). */
  ambient: "absolute inset-0 bg-black/30",
};

export function CareerCover({
  src,
  mode,
  focalX = 50,
  focalY = 50,
  zoom = 1,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-violet-950 via-violet-900 to-stone-950",
}: {
  src?: string;
  mode: CareerCoverMode;
  /** 0–100, percentage object-position. */
  focalX?: number;
  focalY?: number;
  /** >= 1, transform scale — non-destructive. */
  zoom?: number;
  className?: string;
  /** Backdrop when no image is available. */
  fallbackClassName?: string;
}) {
  if (mode === "none" || !src) {
    return <div aria-hidden className={`${className} ${fallbackClassName}`} />;
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        style={
          {
            objectPosition: `${focalX}% ${focalY}%`,
            transform: `scale(${zoom})`,
          } as CSSProperties
        }
      />
      <div aria-hidden className={SHADES[mode]} />
    </div>
  );
}
