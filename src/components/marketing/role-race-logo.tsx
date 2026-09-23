/**
 * RoleRace brand mark — stylized "R" with a subtle checkered/racing
 * flag motif, as clean inline SVG so it stays crisp at any size.
 */
export function RoleRaceLogo({
  className = "",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* stylized R */}
        <path
          d="M5 23V4h8.2c3.6 0 6.1 2.2 6.1 5.4 0 2.5-1.5 4.3-3.8 5l4.4 8.6h-4.1l-3.9-8h-3.6v8H5Zm3.3-10.7h4.6c1.9 0 3.1-1.1 3.1-2.9s-1.2-2.8-3.1-2.8H8.3v5.7Z"
          fill="currentColor"
          className="text-emerald-800"
        />
        {/* checkered flag motif — trailing the R's top-right */}
        <g>
          <rect
            x="20.4"
            y="1.6"
            width="2.2"
            height="2.2"
            className="fill-emerald-700"
          />
          <rect
            x="22.6"
            y="3.8"
            width="2.2"
            height="2.2"
            className="fill-emerald-700"
          />
          <rect
            x="22.6"
            y="1.6"
            width="2.2"
            height="2.2"
            className="fill-stone-300"
          />
          <rect
            x="20.4"
            y="3.8"
            width="2.2"
            height="2.2"
            className="fill-stone-300"
          />
          <rect
            x="20.4"
            y="6"
            width="2.2"
            height="2.2"
            className="fill-emerald-700"
          />
          <rect
            x="22.6"
            y="6"
            width="2.2"
            height="2.2"
            className="fill-stone-300"
          />
        </g>
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-stone-900">
          RoleRace
        </span>
      )}
    </span>
  );
}
