"use client";

import { MapPin, Briefcase } from "lucide-react";

import type { CardThemeTokens } from "@/lib/career-card-theme-styles";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
  type PhotoPosition,
} from "@/components/candidate/public-profile/career-card-photo";

export type CareerCardIdentityProps = {
  name: string;
  headline: string | null;
  photoUrl: string | null;
  coverUrl: string | null;
  photoPosition: PhotoPosition;
  coverPosition: PhotoPosition;
  initials: string;
  openToOpportunities: boolean;
  tokens: CardThemeTokens;
  /** Optional builder-only badge rendered after the open-to-work pill. */
  builderBadge?: React.ReactNode;
  /** Optional compact location/focus shown inline (Builder preview). */
  location?: string | null;
  currentFocus?: string | null;
  /** Optional className for the content wrapper (default: centered). */
  contentClassName?: string;
  /** When false the cover is not rendered (public page handles cover separately). */
  showCover?: boolean;
};

/**
 * Shared Career Card identity block — cover, avatar, name, headline,
 * badges, and optional inline facts.  Consumes theme tokens so the same
 * visual treatment is used in the public page and the Builder preview.
 *
 * This is a presentation component: no data fetching, no server actions,
 * no persistence logic.
 */
export function CareerCardIdentity({
  name,
  headline,
  photoUrl,
  coverUrl,
  photoPosition,
  coverPosition,
  initials,
  openToOpportunities,
  tokens,
  builderBadge,
  location,
  currentFocus,
  contentClassName = "flex flex-col items-center gap-3 p-5 text-center",
  showCover = true,
}: CareerCardIdentityProps) {
  return (
    <div className="flex flex-col">
      {/* Cover */}
      {showCover && coverUrl ? (
        <div className={tokens.coverWrap}>
          <CareerCardCoverPhoto
            src={coverUrl}
            alt=""
            position={coverPosition}
            frameClassName="absolute inset-0 size-full"
          />
          {tokens.coverOverlay && (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 ${tokens.coverOverlay}`}
            />
          )}
        </div>
      ) : null}

      {/* Avatar + Identity */}
      <div className={contentClassName}>
        <div className={coverUrl ? tokens.coverAvatarPull : ""}>
          {photoUrl ? (
            <CareerCardProfilePhoto
              src={photoUrl}
              alt={`${name} profile photo`}
              position={photoPosition}
              frameClassName={tokens.avatarImg}
            />
          ) : (
            <div aria-hidden className={`relative ${tokens.avatar}`}>
              {initials}
            </div>
          )}
        </div>

        {openToOpportunities && (
          <span className={`mt-1 ${tokens.openBadge}`}>
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-emerald-500"
            />
            Open to opportunities
          </span>
        )}

        {builderBadge}

        <div className="space-y-1">
          <h3 className={tokens.h1}>{name}</h3>
          {headline ? <p className={tokens.headline}>{headline}</p> : null}
        </div>

        {(location || currentFocus) && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {location ? (
              <span
                className={`inline-flex items-center gap-1 ${tokens.faint}`}
              >
                <MapPin className="size-3" aria-hidden />
                {location}
              </span>
            ) : null}
            {currentFocus ? (
              <span
                className={`inline-flex items-center gap-1 ${tokens.faint}`}
              >
                <Briefcase className="size-3" aria-hidden />
                {currentFocus}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
