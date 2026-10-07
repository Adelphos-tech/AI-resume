"use client";

export type PhotoPosition = { focalX: number; focalY: number; zoom: number };

export const DEFAULT_PHOTO_POSITION: PhotoPosition = {
  focalX: 0.5,
  focalY: 0.5,
  zoom: 1,
};

/**
 * Shared non-destructive photo renderer — the single positioning
 * implementation used by the settings preview, the editor, and the public
 * Career Card. The stored WebP master is never modified: focal point is
 * applied via object-position and zoom via transform scale.
 */
export function CareerCardProfilePhoto({
  src,
  alt,
  position,
  frameClassName,
}: {
  src: string;
  alt: string;
  position: PhotoPosition;
  /** Theme/parent frame: size, shape, ring — overflow-hidden is enforced. */
  frameClassName: string;
}) {
  const { focalX, focalY, zoom } = position;
  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      aria-hidden={alt ? undefined : true}
    >
      {/* Same image bytes — presentation only; centered crop by default. */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        style={{
          objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalX * 100}% ${focalY * 100}%`,
        }}
      />
    </div>
  );
}

/**
 * Shared non-destructive cover renderer — the single positioning
 * implementation used by the settings preview, the cover editor, and the
 * public Career Card across all four themes. The stored WebP master is
 * never modified: focal point via object-position, zoom via transform
 * scale anchored at the same focal point (which keeps the frame covered —
 * zoom scales outward from the focal, so no empty space is revealed).
 */
export function CareerCardCoverPhoto({
  src,
  alt,
  position,
  frameClassName,
}: {
  src: string;
  alt: string;
  position: PhotoPosition;
  /** Theme frame: height, rounding — overflow-hidden is enforced. */
  frameClassName: string;
}) {
  const { focalX, focalY, zoom } = position;
  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        style={{
          objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalX * 100}% ${focalY * 100}%`,
        }}
      />
    </div>
  );
}
