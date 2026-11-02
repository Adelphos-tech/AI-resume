"use client";

import { useState } from "react";

import {
  saveCompanyProfileAction,
  savePublicProfileSettingsAction,
} from "@/app/candidate/(workspace)/public-profile/actions";
import { CareerCardBuilder } from "./career-card-builder";
import { CareerCardBuilderPreview } from "./career-card-builder-preview";
import type { SaveBarStatus } from "./career-card-save-bar";
import {
  PublicProfileSettings,
  type PublicProfileSettingsState,
} from "./public-profile-settings";
import {
  CompanyProfileSettings,
  EMPTY_COMPANY,
  type CompanyProfileState,
} from "./company-profile-settings";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";
import {
  resolveSponsorPlacement,
  type SponsorPlacement,
} from "@/lib/sponsor-placements";

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
  sponsorOneUrl: "",
  sponsorTwoUrl: "",
  sponsorOnePlacement: "before-footer",
  sponsorTwoPlacement: "before-footer",
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
  sponsorOneImageUrl: initialSponsorOneImageUrl,
  sponsorTwoImageUrl: initialSponsorTwoImageUrl,
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
  sponsorOneImageUrl: string | null;
  sponsorTwoImageUrl: string | null;
}) {
  const [liveState, setLiveState] = useState<PublicProfileSettingsState>(
    initialState ?? DEFAULT_STATE,
  );
  // Last-persisted snapshots — dirty state is computed against these so a
  // successful save flips status to "All changes saved" and any later edit
  // flips it back to "Unsaved changes".
  const [savedProfile, setSavedProfile] =
    useState<PublicProfileSettingsState | null>(initialState);
  const [companyForm, setCompanyForm] = useState<CompanyProfileState>(
    companyInitial ?? EMPTY_COMPANY,
  );
  const [companySaved, setCompanySaved] = useState<CompanyProfileState>(
    companyInitial ?? EMPTY_COMPANY,
  );
  const [companySavedOnce, setCompanySavedOnce] = useState(
    companyInitial !== null,
  );

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profileDirty = savedProfile
    ? JSON.stringify(liveState) !== JSON.stringify(savedProfile)
    : false;
  const companyDirty =
    JSON.stringify(companyForm) !== JSON.stringify(companySaved);
  const dirty = profileDirty || companyDirty;

  const saveStatus: SaveBarStatus = saving
    ? "saving"
    : saveError
      ? "error"
      : dirty
        ? "dirty"
        : savedFlash
          ? "saved"
          : "clean";

  useUnsavedChangesGuard(dirty);

  /** Save whichever forms are dirty — profile and/or company — through the
   *  existing per-area server actions. Never clears user input on failure. */
  async function saveAll() {
    if (saving || !dirty) return;
    setSaving(true);
    setSaveError(null);
    setSavedFlash(false);

    const profileSnapshot = liveState;
    const companySnapshot = companyForm;
    const errors: string[] = [];

    if (profileDirty) {
      try {
        const r = await savePublicProfileSettingsAction({
          publicHeadline: profileSnapshot.publicHeadline,
          publicBio: profileSnapshot.publicBio,
          publicLocation: profileSnapshot.publicLocation,
          currentFocus: profileSnapshot.currentFocus,
          workAuthorization: profileSnapshot.workAuthorization,
          openToOpportunities: profileSnapshot.openToOpportunities,
          linkedinUrl: profileSnapshot.linkedinUrl,
          githubUrl: profileSnapshot.githubUrl,
          websiteUrl: profileSnapshot.websiteUrl,
          sponsorOneUrl: profileSnapshot.sponsorOneUrl,
          sponsorTwoUrl: profileSnapshot.sponsorTwoUrl,
          sponsorOnePlacement: profileSnapshot.sponsorOnePlacement,
          sponsorTwoPlacement: profileSnapshot.sponsorTwoPlacement,
          whatsappNumber: profileSnapshot.whatsappNumber,
          whatsappCountry: profileSnapshot.whatsappCountry,
          showWhatsapp: profileSnapshot.showWhatsapp,
          showExperience: profileSnapshot.showExperience,
          showEducation: profileSnapshot.showEducation,
          showSkills: profileSnapshot.showSkills,
          showProjects: profileSnapshot.showProjects,
          showCertifications: profileSnapshot.showCertifications,
          showLanguages: profileSnapshot.showLanguages,
          featuredResumeVariantId:
            profileSnapshot.featuredResumeVariantId || null,
          themeId: profileSnapshot.themeId,
          accentColorId: profileSnapshot.accentColorId,
          cardStyleId: profileSnapshot.cardStyleId,
          nfcCompactSkinId: profileSnapshot.nfcCompactSkinId,
        });
        if (r.success) setSavedProfile(profileSnapshot);
        else errors.push(r.message ?? "Profile settings were not saved.");
      } catch {
        errors.push("Profile settings were not saved.");
      }
    }

    if (companyDirty) {
      if (!companySnapshot.companyName.trim()) {
        errors.push("Add a company name to save company details.");
      } else {
        try {
          const r = await saveCompanyProfileAction(companySnapshot);
          if (r.success) {
            setCompanySaved(companySnapshot);
            setCompanySavedOnce(true);
          } else {
            errors.push(r.message ?? "Company details were not saved.");
          }
        } catch {
          errors.push("Company details were not saved.");
        }
      }
    }

    if (errors.length > 0) setSaveError(errors.join(" "));
    else setSavedFlash(true);
    setSaving(false);
  }

  // Server-backed photo/cover state — kept in sync with persisted data so
  // the right-side preview reflects uploads, removals and position changes.
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [liveLogoUrl, setLiveLogoUrl] = useState<string | null>(logoUrl);
  const [logoVersion, setLogoVersion] = useState(0);
  // Sponsor media — persists immediately via dedicated routes (same
  // semantics as photo/logo); version bump busts the preview cache.
  const [sponsorOneUrl, setSponsorOneUrl] = useState<string | null>(
    initialSponsorOneImageUrl,
  );
  const [sponsorTwoUrl, setSponsorTwoUrl] = useState<string | null>(
    initialSponsorTwoImageUrl,
  );
  const [sponsorVersion, setSponsorVersion] = useState(0);
  const [photoPosition, setPhotoPosition] =
    useState<PhotoPosition>(initialPhotoPosition);
  const [coverPosition, setCoverPosition] =
    useState<PhotoPosition>(initialCoverPosition);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [coverVersion, setCoverVersion] = useState(0);

  const effectivePhotoUrl = buildEffectiveImageUrl(photoUrl, photoVersion);
  const effectiveCoverUrl = buildEffectiveImageUrl(coverUrl, coverVersion);
  const effectiveLogoUrl = buildEffectiveImageUrl(liveLogoUrl, logoVersion);
  const effectiveSponsorOneUrl = buildEffectiveImageUrl(
    sponsorOneUrl,
    sponsorVersion,
  );
  const effectiveSponsorTwoUrl = buildEffectiveImageUrl(
    sponsorTwoUrl,
    sponsorVersion,
  );

  const preview = (
    <CareerCardBuilderPreview
      state={initialState ? liveState : null}
      displayName={displayName}
      photoUrl={effectivePhotoUrl}
      coverUrl={effectiveCoverUrl}
      photoPosition={photoPosition}
      coverPosition={coverPosition}
      isPublished={isPublished}
      companyInitial={companyInitial}
      logoUrl={effectiveLogoUrl}
      sponsors={[
        {
          imageUrl: effectiveSponsorOneUrl,
          url: liveState.sponsorOneUrl.trim() || null,
          placement: resolveSponsorPlacement(liveState.sponsorOnePlacement),
        },
        {
          imageUrl: effectiveSponsorTwoUrl,
          url: liveState.sponsorTwoUrl.trim() || null,
          placement: resolveSponsorPlacement(liveState.sponsorTwoPlacement),
        },
      ].filter(
        (
          s,
        ): s is {
          imageUrl: string;
          url: string | null;
          placement: SponsorPlacement;
        } => Boolean(s.imageUrl),
      )}
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
    sponsorOneImageUrl: effectiveSponsorOneUrl,
    sponsorTwoImageUrl: effectiveSponsorTwoUrl,
    onSponsorImageChange: (_slot: 1 | 2, url: string | null) => {
      if (_slot === 1) setSponsorOneUrl(url);
      else setSponsorTwoUrl(url);
      setSponsorVersion((v) => v + 1);
    },
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
          <CompanyProfileSettings
            initial={companyInitial}
            logoUrl={liveLogoUrl}
            form={companyForm}
            onFormChange={setCompanyForm}
            hasSavedRow={companySavedOnce}
            onLogoUrlChange={(url) => {
              setLiveLogoUrl(url);
              setLogoVersion((v) => v + 1);
            }}
          />
        ),
      }}
      preview={preview}
      saveState={
        initialState !== null
          ? { status: saveStatus, message: saveError, onSave: saveAll }
          : undefined
      }
    />
  );
}
