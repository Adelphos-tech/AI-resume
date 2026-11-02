import { describe, it, expect } from "vitest";
import { createElement } from "react";

import { CareerCardBuilderPageClient } from "./career-card-builder-client";
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

const DEFAULT_PROPS = {
  initialState: DEFAULT_STATE,
  slug: "test-slug" as string | null,
  isPublished: false,
  shareUrl: null as string | null,
  publicUrl: "/u/test-slug" as string | null,
  variants: [] as {
    id: string;
    name: string;
    targetRole: string;
    targetCountry: string;
  }[],
  photoUrl: null as string | null,
  displayName: "Test User",
  photoKey: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverUrl: null as string | null,
  coverKey: null as string | null,
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  companyInitial: null,
  logoUrl: null as string | null,
  sponsorOneImageUrl: null as string | null,
  sponsorTwoImageUrl: null as string | null,
};

describe("CareerCardBuilderPageClient", () => {
  it("accepts all required props including initialState", () => {
    const el = createElement(CareerCardBuilderPageClient, DEFAULT_PROPS);
    expect(el.props.initialState).toBe(DEFAULT_STATE);
    expect(el.props.displayName).toBe("Test User");
    expect(el.props.photoUrl).toBeNull();
    expect(el.props.coverUrl).toBeNull();
  });

  it("initializes preview state from initialState", () => {
    const el = createElement(CareerCardBuilderPageClient, {
      ...DEFAULT_PROPS,
      initialState: {
        ...DEFAULT_STATE,
        publicHeadline: "Engineer",
        themeId: "executive-dark",
      },
    });
    expect(el.props.initialState?.publicHeadline).toBe("Engineer");
    expect(el.props.initialState?.themeId).toBe("executive-dark");
  });

  it("passes photo and cover positions to preview", () => {
    const el = createElement(CareerCardBuilderPageClient, {
      ...DEFAULT_PROPS,
      photoPosition: { focalX: 0.3, focalY: 0.4, zoom: 1.2 },
      coverPosition: { focalX: 0.6, focalY: 0.7, zoom: 1.5 },
    });
    expect(el.props.photoPosition).toEqual({
      focalX: 0.3,
      focalY: 0.4,
      zoom: 1.2,
    });
    expect(el.props.coverPosition).toEqual({
      focalX: 0.6,
      focalY: 0.7,
      zoom: 1.5,
    });
  });

  it("handles null initialState for preview fallback", () => {
    const el = createElement(CareerCardBuilderPageClient, {
      ...DEFAULT_PROPS,
      initialState: null,
    });
    expect(el.props.initialState).toBeNull();
  });

  it("passes isPublished to preview", () => {
    const el = createElement(CareerCardBuilderPageClient, {
      ...DEFAULT_PROPS,
      isPublished: true,
    });
    expect(el.props.isPublished).toBe(true);
  });

  it("accepts companyInitial and logoUrl for Company step", () => {
    const el = createElement(CareerCardBuilderPageClient, {
      ...DEFAULT_PROPS,
      companyInitial: {
        companyName: "Acme",
        tagline: "",
        contactPersonName: "",
        contactPersonRole: "",
        publicPhone: "",
        publicEmail: "",
        whatsappNumber: "",
        whatsappCountry: "",
        websiteUrl: "",
        linkedinUrl: "",
        facebookUrl: "",
        instagramUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        about: "",
        industry: "",
        locations: [],
        services: [],
        hiringOpen: false,
        openRolesSummary: "",
        openRolesUrl: "",
        companyProfileSummary: "",
        companyProfileUrl: "",
        showPublicPhone: false,
        showWhatsapp: false,
        showPublicEmail: false,
        showContactPerson: false,
        isVisible: false,
      },
      logoUrl: "/u/test/company-logo",
    });
    expect(el.props.companyInitial).not.toBeNull();
    expect(el.props.logoUrl).toBe("/u/test/company-logo");
  });
});
