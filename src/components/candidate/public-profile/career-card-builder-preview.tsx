"use client";

import { Globe, MapPin, Briefcase } from "lucide-react";

import { cardStyleTokens } from "@/lib/career-card-theme-styles";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
} from "@/components/candidate/public-profile/career-card-photo";
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
  );
  const coverWrap = tokens.premium?.coverWrap ?? tokens.base.coverWrap;

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  const headline = state.publicHeadline.trim() || displayName;
  const location = state.publicLocation.trim();
  const focus = state.currentFocus.trim();

  return (
    <div className="flex flex-col">
      {/* Cover */}
      <div className={`${coverWrap} overflow-hidden`}>
        {coverUrl ? (
          <CareerCardCoverPhoto
            src={coverUrl}
            alt=""
            position={coverPosition}
            frameClassName="absolute inset-0 size-full"
          />
        ) : (
          <div className="grid size-full place-items-center bg-stone-100 text-xs text-stone-400">
            No cover
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center gap-3 p-5 text-center">
        <div className="-mt-10 rounded-full border-4 border-white bg-white shadow-sm">
          {photoUrl ? (
            <CareerCardProfilePhoto
              src={photoUrl}
              alt={`${displayName} profile photo`}
              position={photoPosition}
              frameClassName="size-20 rounded-full"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-full bg-emerald-700 text-lg font-bold text-white">
              {initials}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900">{displayName}</h3>
          {headline !== displayName ? (
            <p className="text-sm font-medium text-stone-600">{headline}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500">
          {location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              {location}
            </span>
          ) : null}
          {focus ? (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3" aria-hidden />
              {focus}
            </span>
          ) : null}
        </div>

        {!isPublished ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            <Globe className="size-3" aria-hidden />
            Not published
          </span>
        ) : state.openToOpportunities ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Open to opportunities
          </span>
        ) : null}
      </div>
    </div>
  );
}
