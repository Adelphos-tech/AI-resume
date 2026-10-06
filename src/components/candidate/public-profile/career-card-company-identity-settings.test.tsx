import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardCompanyIdentitySettings } from "./career-card-company-identity-settings";
import type { CompanyProfileState } from "./company-profile-settings";

const DEFAULT_FORM: CompanyProfileState = {
  companyName: "Acme Inc",
  tagline: "We build things",
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
  showPublicEmail: false,
  showWhatsapp: false,
  showContactPerson: false,
  isVisible: false,
};

function makeProps(form?: Partial<CompanyProfileState>) {
  return {
    form: { ...DEFAULT_FORM, ...form },
    setForm: () => {},
    logo: null,
    logoV: 0,
    logoBusy: false,
    logoMsg: null,
    logoRef: { current: null },
    onLogoSelected: () => {},
    onRemoveLogo: () => {},
  };
}

describe("CareerCardCompanyIdentitySettings", () => {
  it("renders company name field", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain('id="cp-name"');
    expect(html).toContain("Company name");
    expect(html).toContain("The name shown on your company profile.");
  });

  it("renders tagline field", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain('id="cp-tagline"');
    expect(html).toContain("Tagline");
    expect(html).toContain("A short description of what your company does.");
  });

  it("renders logo upload area when no logo exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain("Upload logo");
    expect(html).not.toContain("Replace logo");
    expect(html).not.toContain("Remove");
  });

  it("renders logo replace/remove when logo exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, {
        ...makeProps(),
        logo: "https://example.com/logo.png",
      }),
    );
    expect(html).toContain("Replace logo");
    expect(html).toContain("Remove");
  });

  it("renders logo constraints", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain("JPG, PNG or WebP");
    expect(html).toContain("up to 8 MB");
  });

  it("renders about textarea", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain('id="cp-about"');
    expect(html).toContain("About");
    expect(html).toContain("Introduce your company in a few sentences.");
  });

  it("renders industry field", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).toContain('id="cp-industry"');
    expect(html).toContain("Industry");
    expect(html).toContain("The area your company works in.");
  });

  it("does not render unsupported identity fields", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    expect(html).not.toContain("Mission");
    expect(html).not.toContain("Founded");
    expect(html).not.toContain("Team size");
  });

  it("pre-fills values from form state", () => {
    const html = renderToStaticMarkup(
      createElement(
        CareerCardCompanyIdentitySettings,
        makeProps({
          companyName: "Acme",
          tagline: "Build fast",
          about: "We do",
          industry: "Tech",
        }),
      ),
    );
    expect(html).toContain('value="Acme"');
    expect(html).toContain('value="Build fast"');
    expect(html).toContain(">We do</textarea>");
    expect(html).toContain('value="Tech"');
  });

  it("uses consistent input styling classes", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, makeProps()),
    );
    // Should contain the shared input styling
    expect(html).toContain("focus:border-emerald-600/50");
    expect(html).toContain("focus:ring-emerald-600/20");
  });
});
