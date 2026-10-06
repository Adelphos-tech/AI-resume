"use client";

import { useState } from "react";

import { CareerCardBuilder } from "./career-card-builder";
import { CareerCardBuilderPreview } from "./career-card-builder-preview";
import {
  PublicProfileSettings,
  type PublicProfileSettingsState,
} from "./public-profile-settings";
import {
  CompanyProfileSettings,
  type CompanyProfileState,
} from "./company-profile-settings";

type VariantOption = {
  id: string;
  name: string;
  targetRole: string;
  targetCountry: string;
};

type PhotoPosition = { focalX: number; focalY: number; zoom: number };

export function buildEffectiveImageUrl(
  url: string | null,
  version: number,
): string | null {
  if (!url) return null;
  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
}

const DEFAULT_STATE: PublicProfileSettingsState = {
  publicHeadline: "",
  publicBio: "",
  publicLocation: "",
  currentFocus: "",
  workAuthorization: "",
  openToOpportunities: false,
  linkedinUrl: "",
  githubUrl: "",
  websiteUrl: "",
  whatsappNumber: "",
  whatsappCountry: "",
  showWhatsapp: false,
  showExperience: false,
  showEducation: false,
  showSkills: false,
  showProjects: false,
  showCertifications: false,
  showLanguages: false,
  featuredResumeVariantId: "",
  themeId: "role-race-classic",
  accentColorId: "emerald",
  cardStyleId: "standard",
  nfcCompactSkinId: "career-passport",
};

export function CareerCardBuilderPageClient({
  initialState,
  slug,
  isPublished,
  shareUrl,
  publicUrl,
  variants,
  photoUrl: initialPhotoUrl,
  displayName,
  photoKey: initialPhotoKey,
  photoPosition: initialPhotoPosition,
  coverUrl: initialCoverUrl,
  coverKey: initialCoverKey,
  coverPosition: initialCoverPosition,
  companyInitial,
  logoUrl,
}: {
  initialState: PublicProfileSettingsState | null;
  slug: string | null;
  isPublished: boolean;
  shareUrl: string | null;
  publicUrl: string | null;
  variants: VariantOption[];
  photoUrl: string | null;
  displayName: string;
  photoKey: string | null;
  photoPosition: PhotoPosition;
  coverUrl: string | null;
  coverKey: string | null;
  coverPosition: PhotoPosition;
  companyInitial: CompanyProfileState | null;
  logoUrl: string | null;
}) {
  const [liveState, setLiveState] = useState<PublicProfileSettingsState>(
    initialState ?? DEFAULT_STATE,
  );

  // Server-backed photo/cover state — kept in sync with persisted data so
  // the right-side preview reflects uploads, removals and position changes.
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [photoPosition, setPhotoPosition] =
    useState<PhotoPosition>(initialPhotoPosition);
  const [coverPosition, setCoverPosition] =
    useState<PhotoPosition>(initialCoverPosition);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [coverVersion, setCoverVersion] = useState(0);

  const effectivePhotoUrl = buildEffectiveImageUrl(photoUrl, photoVersion);
  const effectiveCoverUrl = buildEffectiveImageUrl(coverUrl, coverVersion);

  const preview = (
    <CareerCardBuilderPreview
      state={initialState ? liveState : null}
      displayName={displayName}
      photoUrl={effectivePhotoUrl}
      coverUrl={effectiveCoverUrl}
      photoPosition={photoPosition}
      coverPosition={coverPosition}
      isPublished={isPublished}
    />
  );

  const settingsProps = {
    slug,
    isPublished,
    shareUrl,
    publicUrl,
    variants,
    photoUrl: effectivePhotoUrl,
    displayName,
    photoKey: initialPhotoKey,
    photoPosition,
    coverUrl: effectiveCoverUrl,
    coverKey: initialCoverKey,
    coverPosition,
    initial: initialState,
    formState: liveState,
    onFormChange: setLiveState,
    onPhotoUrlChange: (url: string | null) => {
      setPhotoUrl(url);
      setPhotoVersion((v) => v + 1);
    },
    onCoverUrlChange: (url: string | null) => {
      setCoverUrl(url);
      setCoverVersion((v) => v + 1);
    },
    onPhotoPositionChange: setPhotoPosition,
    onCoverPositionChange: setCoverPosition,
  };

  return (
    <CareerCardBuilder
      stepContent={{
        basics: (
          <PublicProfileSettings {...settingsProps} activeStep="basics" />
        ),
        design: (
          <PublicProfileSettings {...settingsProps} activeStep="design" />
        ),
        company: (
          <CompanyProfileSettings initial={companyInitial} logoUrl={logoUrl} />
        ),
        preview: (
          <PublicProfileSettings {...settingsProps} activeStep="preview" />
        ),
      }}
      preview={preview}
    />
  );
}
