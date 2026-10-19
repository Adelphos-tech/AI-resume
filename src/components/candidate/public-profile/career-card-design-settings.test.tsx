import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardDesignSettings } from "./career-card-design-settings";
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

describe("CareerCardDesignSettings", () => {
  it("renders theme options", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("LinkMeU Classic");
    expect(html).toContain("Corporate Clean");
    expect(html).toContain("Executive Dark");
    expect(html).toContain("Tech Minimal");
    expect(html).toContain("NFC Compact");
  });

  it("marks current theme as selected", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: { ...DEFAULT_STATE, themeId: "executive-dark" },
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Executive Dark");
    // The selected theme should have the selected badge
    expect(html).toContain("Selected");
  });

  it("renders AI recommendation button", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Recommend a theme with AI");
  });

  it("shows recommendation result when reco is present", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: {
          label: "Executive Dark",
          recommendedThemeId: "executive-dark",
          reasons: ["Leadership presence", "Premium feel"],
          alternatives: [],
        },
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Recommended for you");
    expect(html).toContain("Executive Dark");
    expect(html).toContain("Leadership presence");
    expect(html).toContain("Use Executive Dark");
    expect(html).toContain("Dismiss");
  });

  it("shows recommendation error when recoErr is present", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: "Something went wrong.",
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Something went wrong.");
  });

  it("renders accent color options", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Accent color");
    expect(html).toContain("Emerald");
    expect(html).toContain("Navy");
  });

  it("renders card style options", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Card Style");
    expect(html).toContain("Standard");
    expect(html).toContain("Premium");
  });

  it("shows NFC compact skins when theme is nfc-compact", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: { ...DEFAULT_STATE, themeId: "nfc-compact" },
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Career Passport");
    expect(html).toContain("Crimson Night");
  });

  it("hides NFC compact skins when theme is not nfc-compact", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: { ...DEFAULT_STATE, themeId: "role-race-classic" },
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).not.toContain("Career Passport");
    expect(html).not.toContain("Crimson Night");
  });

  it("disables AI button when recoBusy is true", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: true,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).toContain("Recommending…");
    expect(html).toContain("disabled");
  });

  it("does not use fixed-width inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardDesignSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
        reco: null,
        setReco: () => {},
        recoBusy: false,
        setRecoBusy: () => {},
        recoErr: null,
        setRecoErr: () => {},
      }),
    );
    expect(html).not.toMatch(/style="[^"]*width:\s*\d+px/);
    expect(html).not.toMatch(/class="[^"]*w-\[\d+px\]/);
  });
});
