import { describe, it, expect } from "vitest";

import { buildEffectiveImageUrl } from "./career-card-builder-client";
import type { PublicProfileSettingsState } from "./public-profile-settings";

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

describe("buildEffectiveImageUrl", () => {
  it("appends ?v=1 for a clean URL", () => {
    expect(buildEffectiveImageUrl("/u/test/photo", 1)).toBe(
      "/u/test/photo?v=1",
    );
  });

  it("appends &v=2 when URL already has a query string", () => {
    expect(buildEffectiveImageUrl("/u/test/photo?w=200", 2)).toBe(
      "/u/test/photo?w=200&v=2",
    );
  });

  it("returns null when url is null", () => {
    expect(buildEffectiveImageUrl(null, 1)).toBeNull();
  });
});

describe("CareerCardBuilderPageClient image-state isolation", () => {
  it("keeps liveState headline intact when photo URL changes", () => {
    // Simulate the component's internal state separation:
    // liveState owns form fields; photoUrl/coverUrl are separate.
    const liveState: PublicProfileSettingsState = {
      ...DEFAULT_STATE,
      publicHeadline: "Unsaved Headline",
    };

    // Photo callback fires with a new URL (e.g., after upload)
    const nextPhotoUrl = "/u/test/photo";
    const photoVersion = 3;
    const effectivePhotoUrl = buildEffectiveImageUrl(
      nextPhotoUrl,
      photoVersion,
    );

    // Cover callback fires with a new URL (e.g., after upload)
    const nextCoverUrl = "/u/test/cover";
    const coverVersion = 2;
    const effectiveCoverUrl = buildEffectiveImageUrl(
      nextCoverUrl,
      coverVersion,
    );

    // The preview receives BOTH liveState AND the separate image URLs.
    // liveState is NEVER mutated by image callbacks.
    expect(liveState.publicHeadline).toBe("Unsaved Headline");
    expect(effectivePhotoUrl).toBe("/u/test/photo?v=3");
    expect(effectiveCoverUrl).toBe("/u/test/cover?v=2");

    // Verify the preview would see both: headline from liveState, images from URLs
    const previewProps = {
      state: liveState,
      photoUrl: effectivePhotoUrl,
      coverUrl: effectiveCoverUrl,
    };
    expect(previewProps.state.publicHeadline).toBe("Unsaved Headline");
    expect(previewProps.photoUrl).toBe("/u/test/photo?v=3");
    expect(previewProps.coverUrl).toBe("/u/test/cover?v=2");
  });

  it("keeps liveState intact when cover position changes", () => {
    const liveState: PublicProfileSettingsState = {
      ...DEFAULT_STATE,
      publicHeadline: "Still Unsaved",
      publicLocation: "Berlin",
    };

    // Cover position callback fires with new framing
    const nextCoverPosition = { focalX: 0.3, focalY: 0.4, zoom: 1.5 };

    // liveState remains untouched — only the separate coverPosition changes
    expect(liveState.publicHeadline).toBe("Still Unsaved");
    expect(liveState.publicLocation).toBe("Berlin");
    expect(nextCoverPosition).toEqual({ focalX: 0.3, focalY: 0.4, zoom: 1.5 });

    // Preview receives both
    const previewProps = {
      state: liveState,
      coverPosition: nextCoverPosition,
    };
    expect(previewProps.state.publicHeadline).toBe("Still Unsaved");
    expect(previewProps.coverPosition).toEqual({
      focalX: 0.3,
      focalY: 0.4,
      zoom: 1.5,
    });
  });

  it("does not replace unrelated liveState fields on image update", () => {
    const liveState: PublicProfileSettingsState = {
      ...DEFAULT_STATE,
      publicHeadline: "Headline A",
      publicBio: "Bio B",
      publicLocation: "Loc C",
      currentFocus: "Focus D",
      themeId: "executive-dark",
      accentColorId: "navy",
    };

    // Image URL update happens
    const newPhotoUrl = buildEffectiveImageUrl("/u/test/photo", 5);

    // Verify no liveState field was overwritten
    expect(liveState.publicHeadline).toBe("Headline A");
    expect(liveState.publicBio).toBe("Bio B");
    expect(liveState.publicLocation).toBe("Loc C");
    expect(liveState.currentFocus).toBe("Focus D");
    expect(liveState.themeId).toBe("executive-dark");
    expect(liveState.accentColorId).toBe("navy");
    expect(newPhotoUrl).toBe("/u/test/photo?v=5");
  });
});
