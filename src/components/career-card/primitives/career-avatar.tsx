/* eslint-disable @next/next/no-img-element */

/**
 * Reusable Career Card avatar — image rendering, ring, initials fallback,
 * and a finite sizing contract. Placement/geometry stays with the
 * composition.
 */

const SIZES = {
  sm: "size-16 text-lg",
  md: "size-20 text-2xl",
  lg: "size-28 text-3xl",
  xl: "size-36 text-4xl",
} as const;

export type CareerAvatarSize = keyof typeof SIZES;

export function CareerAvatar({
  src,
  focalX = 0.5,
  focalY = 0.35,
  zoom = 1,
  initials,
  name,
  size = "lg",
  ringClassName = "ring-4 ring-white/20",
  haloClassName,
  fallbackClassName = "bg-violet-700 text-white",
  className = "",
}: {
  src?: string;
  /** Normalized 0..1 object-position; >= 1 transform scale (non-destructive). */
  focalX?: number;
  focalY?: number;
  zoom?: number;
  initials: string;
  name: string;
  size?: CareerAvatarSize;
  ringClassName?: string;
  /** Optional soft halo behind the portrait. */
  haloClassName?: string;
  fallbackClassName?: string;
  className?: string;
}) {
  return (
    <div className={`shrink-0 ${className}`}>
      <div className="relative">
        {haloClassName && (
          <span
            aria-hidden
            className={`absolute -inset-2 rounded-full blur-md ${haloClassName}`}
          />
        )}
        <div
          className={`relative grid place-items-center overflow-hidden rounded-full ${SIZES[size]} ${ringClassName}`}
        >
          {src ? (
            <img
              src={src}
              alt={name}
              className="size-full object-cover"
              style={{
                objectPosition: `${focalX * 100}% ${focalY * 100}%`,
                transform: `scale(${zoom})`,
              }}
            />
          ) : (
            <span
              aria-hidden
              className={`grid size-full place-items-center font-bold ${fallbackClassName}`}
            >
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
