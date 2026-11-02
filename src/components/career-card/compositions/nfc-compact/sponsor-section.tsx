import { createElement, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import {
  CONTENT_ANCHORS,
  resolveSponsorPlacement,
  type ContentAnchor,
  type SponsorPlacement,
} from "@/lib/sponsor-placements";

export interface SponsorItem {
  /** Authorized media URL ("/u/<slug>/sponsor/<slot>") — opaque keys never
   *  reach the client. */
  imageUrl: string;
  /** Optional http(s) destination — validated server-side. */
  url: string | null;
  /** Safe anchor position inside the card — resolved defensively server
   *  side, so it is always a valid registry id by the time it renders. */
  placement: SponsorPlacement;
}

/** Per-anchor slot nodes injected into skin content adapters. Each is a
 *  SponsorSection (or null when that anchor has no sponsors). */
export type SponsorSlots = Partial<Record<ContentAnchor, ReactNode>>;

/**
 * Groups sponsors by their resolved placement and wraps each non-empty
 * group in a SponsorSection — Sponsors sharing an anchor render in one
 * strip, Sponsor 1 always before Sponsor 2 (input order preserved).
 */
export function buildSponsorSlots(
  sponsors: SponsorItem[] | null | undefined,
  variant: "light" | "dark" = "light",
): SponsorSlots {
  const slots: SponsorSlots = {};
  for (const anchor of CONTENT_ANCHORS) {
    const group = (sponsors ?? []).filter(
      (s) => resolveSponsorPlacement(s.placement) === anchor,
    );
    if (group.length > 0) {
      slots[anchor] = createElement(SponsorSection, {
        sponsors: group,
        variant,
      });
    }
  }
  return slots;
}

/** Sponsors whose resolved placement is the card-footer position —
 *  rendered by the shell directly above the CTA. */
export function footerSponsors(
  sponsors: SponsorItem[] | null | undefined,
): SponsorItem[] {
  return (sponsors ?? []).filter(
    (s) => resolveSponsorPlacement(s.placement) === "before-footer",
  );
}

/**
 * Shared sponsor strip for the public Career Card — rendered inside the
 * card frame, just above the final action area. Hidden entirely when no
 * sponsor images exist; each image preserves its aspect ratio
 * (object-contain) and becomes a sponsored outbound link only when a
 * validated destination URL is saved. `variant` matches the light-skin
 * surface tokens or Crimson Night's dark surface.
 */
export function SponsorSection({
  sponsors,
  variant = "light",
}: {
  sponsors?: SponsorItem[] | null;
  variant?: "light" | "dark";
}) {
  const items = (sponsors ?? []).filter((s) => s.imageUrl);
  if (items.length === 0) return null;
  const dark = variant === "dark";

  return (
    <section
      aria-label="Sponsored"
      className={`pm-fade mt-5 rounded-2xl border p-3 ${
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-stone-200/80 bg-stone-50/80"
      }`}
      style={{ animationDelay: "0.24s" }}
    >
      <p
        className={`mb-2 text-center text-[9px] font-semibold tracking-[0.18em] uppercase ${
          dark ? "text-white/40" : "text-stone-400"
        }`}
      >
        Sponsored
      </p>
      <div
        className={`grid items-center gap-3 ${
          items.length > 1 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {items.map((s, i) => {
          const img = (
            // Authorized media route; native <img> preserves aspect ratio.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.imageUrl}
              alt={`Sponsor ${i + 1}`}
              className="h-14 w-full object-contain"
              loading="lazy"
            />
          );
          return s.url ? (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label={`Sponsor ${i + 1} (opens in a new tab)`}
              className={`flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                dark
                  ? "hover:bg-white/10 focus-visible:outline-white/60"
                  : "hover:bg-stone-200/60 focus-visible:outline-stone-400"
              }`}
            >
              {img}
              <ExternalLink
                className={`size-3 shrink-0 ${dark ? "text-white/40" : "text-stone-400"}`}
                aria-hidden
              />
            </a>
          ) : (
            <div
              key={i}
              className="flex items-center justify-center px-2 py-1.5"
            >
              {img}
            </div>
          );
        })}
      </div>
    </section>
  );
}
