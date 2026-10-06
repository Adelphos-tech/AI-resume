"use client";

import { Globe } from "lucide-react";

import { cardStyleTokens } from "@/lib/career-card-theme-styles";
import { CareerCardIdentity } from "@/components/candidate/public-profile/career-card-identity";
import type { PublicProfileSettingsState } from "@/components/candidate/public-profile/public-profile-settings";

export function CareerCardBuilderPreview({
  state,
  displayName,
  photoUrl,
  coverUrl,
  photoPosition,
  coverPosition,
  isPublished,
}: {
  state: PublicProfileSettingsState | null;
  displayName: string;
  photoUrl: string | null;
  coverUrl: string | null;
  photoPosition: { focalX: number; focalY: number; zoom: number };
  coverPosition: { focalX: number; focalY: number; zoom: number };
  isPublished: boolean;
}) {
  if (!state) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-400">
        Create your Career Card to see a preview.
      </div>
    );
  }

  const tokens = cardStyleTokens(
    state.themeId,
    state.accentColorId,
    state.cardStyleId,
  ).base;

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  const headline = state.publicHeadline.trim() || null;

  const builderBadge = !isPublished ? (
    <span
      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tokens.faint}`}
    >
      <Globe className="size-3" aria-hidden />
      Not published
    </span>
  ) : null;

  return (
    <CareerCardIdentity
      name={displayName}
      headline={headline}
      photoUrl={photoUrl}
      coverUrl={coverUrl}
      photoPosition={photoPosition}
      coverPosition={coverPosition}
      initials={initials}
      openToOpportunities={isPublished && state.openToOpportunities}
      tokens={tokens}
      builderBadge={builderBadge}
      location={state.publicLocation.trim() || null}
      currentFocus={state.currentFocus.trim() || null}
    />
  );
}
