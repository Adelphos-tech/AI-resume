import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardLinksSettings } from "./career-card-links-settings";
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

describe("CareerCardLinksSettings", () => {
  it("renders all supported link fields", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("LinkedIn");
    expect(html).toContain("GitHub");
    expect(html).toContain("Website");
    expect(html).toContain("WhatsApp");
    // No unsupported fields
    expect(html).not.toContain("Instagram");
    expect(html).not.toContain("Twitter");
    expect(html).not.toContain("X");
    expect(html).not.toContain("Behance");
  });

  it("shows per-field descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("Your professional profile link.");
    expect(html).toContain("Your public development work.");
    expect(html).toContain("Your personal or professional site.");
    expect(html).toContain("Let recruiters reach you directly on WhatsApp.");
  });

  it("renders URL inputs with correct ids", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain('id="pp-linkedinUrl"');
    expect(html).toContain('id="pp-githubUrl"');
    expect(html).toContain('id="pp-websiteUrl"');
    expect(html).toContain('id="pp-whatsapp"');
    expect(html).toContain('id="pp-whatsapp-country"');
  });

  it("renders WhatsApp toggle switch", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: { ...DEFAULT_STATE, showWhatsapp: true },
        setForm: () => {},
      }),
    );
    expect(html).toContain('id="pp-show-whatsapp"');
    expect(html).toContain('role="switch"');
    expect(html).toContain("bg-emerald-600");
  });

  it("shows WhatsApp toggle as off when false", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: { ...DEFAULT_STATE, showWhatsapp: false },
        setForm: () => {},
      }),
    );
    expect(html).toContain("bg-stone-300");
  });

  it("shows empty-state helper when no WhatsApp number", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: { ...DEFAULT_STATE, whatsappNumber: "" },
        setForm: () => {},
      }),
    );
    expect(html).toContain("Pick a country and enter your number first.");
  });

  it("shows visibility hint when WhatsApp number exists but hidden", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: {
          ...DEFAULT_STATE,
          whatsappNumber: "12345",
          showWhatsapp: false,
        },
        setForm: () => {},
      }),
    );
    expect(html).toContain("Saved privately — not shown publicly.");
  });

  it("shows visibility hint when WhatsApp number exists and shown", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: { ...DEFAULT_STATE, whatsappNumber: "12345", showWhatsapp: true },
        setForm: () => {},
      }),
    );
    expect(html).toContain("Shown on your Career Card.");
  });

  it("uses responsive grid for WhatsApp fields", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain("sm:grid-cols-[200px_minmax(0,1fr)]");
  });

  it("does not use fixed-width inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    // Inputs should use w-full, not explicit pixel widths
    expect(html).not.toMatch(/class="[^"]*w-\[\d+px\]/);
  });

  it("uses type=url for social links", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    const urlInputs = html.match(/type="url"/g);
    expect(urlInputs?.length).toBe(3);
  });

  it("uses inputMode=tel for WhatsApp number", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardLinksSettings, {
        form: DEFAULT_STATE,
        setForm: () => {},
      }),
    );
    expect(html).toContain('inputMode="tel"');
  });
});
