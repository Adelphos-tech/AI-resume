import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CompanyProfileSettings,
  EMPTY_COMPANY,
} from "./company-profile-settings";

describe("CompanyProfileSettings", () => {
  it("renders Company title and description", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain('id="cp-title"');
    expect(html).toContain("Company");
    expect(html).toContain("Tell people about your organization.");
  });

  it("renders all supported company fields", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    // Identity
    expect(html).toContain('id="cp-name"');
    expect(html).toContain('id="cp-tagline"');
    expect(html).toContain('id="cp-about"');
    expect(html).toContain('id="cp-industry"');
    // Details (locations / services via ListEditor)
    expect(html).toContain("Locations");
    expect(html).toContain("Products / Services");
    // Contact
    expect(html).toContain('id="cp-cperson"');
    expect(html).toContain('id="cp-crole"');
    expect(html).toContain('id="cp-phone"');
    expect(html).toContain('id="cp-whatsapp"');
    expect(html).toContain('id="cp-email"');
    // Social links
    expect(html).toContain('id="cp-websiteUrl"');
    expect(html).toContain('id="cp-linkedinUrl"');
    expect(html).toContain('id="cp-facebookUrl"');
    expect(html).toContain('id="cp-instagramUrl"');
    expect(html).toContain('id="cp-xUrl"');
    expect(html).toContain('id="cp-youtubeUrl"');
    expect(html).toContain('id="cp-tiktokUrl"');
    // Hiring
    expect(html).toContain('id="cp-orsum"');
    expect(html).toContain('id="cp-orurl"');
    expect(html).toContain('id="cp-cpsum"');
    expect(html).toContain('id="cp-cpurl"');
    // Visibility
    expect(html).toContain("Show company profile publicly");
    // Save is owned by the global save bar — no per-section save button.
    expect(html).not.toContain("Save company profile");
    expect(html).not.toContain("Save Changes");
  });

  it("does not introduce unsupported fields", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).not.toContain("Mission");
    expect(html).not.toContain("Founded");
    expect(html).not.toContain("Team size");
    expect(html).not.toContain("Funding");
    expect(html).not.toContain("Glassdoor");
  });

  it("pre-fills values from initial state", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: { ...EMPTY_COMPANY, companyName: "Acme", tagline: "Build" },
        logoUrl: null,
      }),
    );
    expect(html).toContain('value="Acme"');
    expect(html).toContain('value="Build"');
  });

  it("renders a controlled form when form/onFormChange are provided", () => {
    const form = { ...EMPTY_COMPANY, companyName: "Acme" };
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: null,
        logoUrl: null,
        form,
        onFormChange: () => {},
        hasSavedRow: true,
      }),
    );
    expect(html).toContain('value="Acme"');
  });

  it("renders visibility toggle with description", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain("Show company profile publicly");
    expect(html).toContain(
      "The company section only appears on your published Career Card when enabled.",
    );
  });

  it("shows public hint when visible and saved", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: { ...EMPTY_COMPANY, companyName: "Acme", isVisible: true },
        logoUrl: null,
      }),
    );
    expect(html).toContain("Company profile can appear on NFC Compact.");
  });

  it("shows hidden hint when not visible but saved", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: { ...EMPTY_COMPANY, companyName: "Acme", isVisible: false },
        logoUrl: null,
      }),
    );
    expect(html).toContain(
      "Company profile saved, but it is currently hidden from your public Career Card.",
    );
  });

  it("renders per-field descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain("The name shown on your company profile.");
    expect(html).toContain("A short description of what your company does.");
    expect(html).toContain("Introduce your company in a few sentences.");
    expect(html).toContain("The area your company works in.");
    expect(html).toContain("Locations and services you offer.");
    expect(html).toContain("How people can reach your company.");
    expect(html).toContain("Share open roles and company information.");
    expect(html).toContain("Control when your company profile appears.");
  });

  it("renders logo area with upload button", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain("Upload logo");
  });

  it("renders logo with replace/remove when logoUrl provided", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: "https://example.com/logo.png",
      }),
    );
    expect(html).toContain("Replace logo");
    expect(html).toContain("Remove");
  });

  it("renders WhatsApp country select and number input", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain('id="cp-whatsapp-country"');
    expect(html).toContain('id="cp-whatsapp"');
    expect(html).toContain('inputMode="tel"');
  });

  it("uses type=url for link inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    const urlInputs = html.match(/type="url"/g);
    expect(urlInputs?.length).toBe(9);
  });

  it("uses responsive grid for contact section", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain("sm:grid-cols-2");
  });

  it("uses responsive grid for WhatsApp fields", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).toContain("sm:grid-cols-[200px_minmax(0,1fr)]");
  });

  it("renders no save controls — saving is owned by the global save bar", () => {
    const html = renderToStaticMarkup(
      createElement(CompanyProfileSettings, {
        initial: EMPTY_COMPANY,
        logoUrl: null,
      }),
    );
    expect(html).not.toContain("Save company profile");
    expect(html).not.toContain("Save Changes");
    expect(html).not.toContain("Unsaved changes");
  });
});
