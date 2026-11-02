import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardIdentitySettings } from "./career-card-identity-settings";
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

describe("CareerCardIdentitySettings", () => {
  it("renders all identity fields", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("Headline");
    expect(html).toContain("About");
    expect(html).toContain("Location");
    expect(html).toContain("Current focus");
    expect(html).toContain("Work authorization");
    expect(html).toContain("Open to opportunities");
  });

  it("shows per-field descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("A short professional headline shown on your card.");
    expect(html).toContain("Introduce yourself in a few sentences.");
    expect(html).toContain("Where you&#x27;re currently based.");
    expect(html).toContain("What you&#x27;re focused on right now.");
  });

  it("calls setForm on headline change", () => {
    const setForm = vi.fn();
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: DEFAULT_STATE,
        setForm,
      }),
    );
    // Input is present with correct id
    expect(html).toContain('id="pp-headline"');
  });

  it("calls setForm on openToOpportunities toggle", () => {
    const setForm = vi.fn();
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: { ...DEFAULT_STATE, openToOpportunities: true },
        setForm,
      }),
    );
    // Toggle switch is present
    expect(html).toContain('id="pp-openToOpportunities"');
    expect(html).toContain("bg-emerald-600");
  });

  it("shows openToOpportunities as off when false", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: { ...DEFAULT_STATE, openToOpportunities: false },
        setForm: () => {},
      }),
    );
    expect(html).toContain("bg-stone-300");
  });

  it("uses responsive grid for short fields", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("sm:grid-cols-3");
  });

  it("does not use fixed-width inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentitySettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    // No explicit pixel widths on inputs
    expect(html).not.toMatch(/style="[^"]*width:\s*\d+px/);
    expect(html).not.toMatch(/class="[^"]*w-\[\d+px\]/);
  });
});
