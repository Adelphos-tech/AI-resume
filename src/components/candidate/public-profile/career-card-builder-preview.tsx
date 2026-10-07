"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

import { cardStyleTokens } from "@/lib/career-card-theme-styles";
import { CareerCardIdentity } from "@/components/candidate/public-profile/career-card-identity";
import { NfcCompactCard } from "@/components/career-card/compositions/nfc-compact/nfc-compact-card";
import { CrimsonNightCard } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-card";
import { nfcCompactAccentStyle } from "@/components/career-card/compositions/nfc-compact/nfc-compact-accents";
import type { PublicProfileSettingsState } from "./public-profile-settings";
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";

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

  if (state.themeId === "nfc-compact") {
    return (
      <NfcCompactPreview
        state={state}
        displayName={displayName}
        photoUrl={photoUrl}
        coverUrl={coverUrl}
        coverPosition={coverPosition}
        isPublished={isPublished}
      />
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

function NfcCompactPreview({
  state,
  displayName,
  photoUrl,
  coverUrl,
  coverPosition,
  isPublished,
}: {
  state: PublicProfileSettingsState;
  displayName: string;
  photoUrl: string | null;
  coverUrl: string | null;
  coverPosition: { focalX: number; focalY: number; zoom: number };
  isPublished: boolean;
}) {
  const [active, setActive] = useState<"candidate" | "company">("candidate");

  const accentStyle = nfcCompactAccentStyle(state.accentColorId);

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  const candidate: CompactCandidate = {
    name: displayName,
    headline: state.publicHeadline.trim() || "Career Professional",
    currentRole: state.currentFocus.trim() || undefined,
    portrait: photoUrl ?? undefined,
    cover: coverUrl,
    coverFocalX: coverPosition.focalX,
    coverFocalY: coverPosition.focalY,
    coverZoom: coverPosition.zoom,
    initials,
    linkedin: state.linkedinUrl.trim() || null,
    github: state.githubUrl.trim() || null,
    website: state.websiteUrl.trim() || null,
    professionalSummary: state.publicBio.trim() || undefined,
    skills: [],
    certifications: [],
    portfolioAvailable: false,
    resumeAvailable: false,
    availability:
      isPublished && state.openToOpportunities ? "Open to opportunities" : null,
  };

  const CardComponent =
    state.nfcCompactSkinId === "crimson-night"
      ? CrimsonNightCard
      : NfcCompactCard;

  return (
    <div className="relative">
      <CardComponent
        candidate={candidate}
        active={active}
        onSwitch={setActive}
        accentStyle={accentStyle}
        cta={null}
      />
      {!isPublished && (
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            <Globe className="size-3" aria-hidden />
            Not published
          </span>
        </div>
      )}
    </div>
  );
}
