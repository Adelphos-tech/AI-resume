import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { NfcCompactCompany } from "./nfc-compact-company";
import { ProfessionalConnectCompany } from "./professional-connect/professional-connect-company";
import { CrimsonNightCompany } from "./crimson-night/crimson-night-company";
import { CreativeSpotlightCompany } from "./creative-spotlight/creative-spotlight-company";
import { CareerCardCompanyIdentitySettings } from "@/components/candidate/public-profile/career-card-company-identity-settings";
import { EMPTY_COMPANY } from "@/components/candidate/public-profile/company-profile-settings";
import type { CompactCompany } from "@/components/career-card/dev/nfc-compact-data";

const COMPANY: CompactCompany = {
  companyName: "Wide Wordmark Co",
  logo: "https://example.com/logo.webp",
  locations: [],
  services: [],
};

const editorProps = {
  form: { ...EMPTY_COMPANY, companyName: "Wide Wordmark Co" },
  setForm: () => {},
  logo: "https://example.com/logo.webp",
  logoV: 0,
  logoBusy: false,
  logoMsg: null,
  logoRef: { current: null },
  onLogoSelected: () => {},
  onRemoveLogo: () => {},
};

describe("company logo presentation — all company-capable skins", () => {
  const renderSkin: Record<string, (c: CompactCompany) => string> = {
    "Career Passport": (c) =>
      renderToStaticMarkup(createElement(NfcCompactCompany, { c })),
    "Professional Connect": (c) =>
      renderToStaticMarkup(
        createElement(ProfessionalConnectCompany, { company: c }),
      ),
    "Crimson Night": (c) =>
      renderToStaticMarkup(createElement(CrimsonNightCompany, { c })),
    "Creative Spotlight": (c) =>
      renderToStaticMarkup(
        createElement(CreativeSpotlightCompany, { company: c }),
      ),
  };

  for (const [name, render] of Object.entries(renderSkin)) {
    it(`${name}: logo is ratio-preserving (contain + w-auto + max-w)`, () => {
      const html = render(COMPANY);
      expect(html).toContain("object-contain");
      expect(html).toContain("w-auto");
      expect(html).toMatch(/max-w-\d+/);
      // No fixed-square logo frame — never a size-* box that letterboxes.
      expect(html).not.toMatch(/size-(20|24|28)[^"]*object/);
      expect(html).not.toContain("object-cover");
    });

    it(`${name}: no-logo fallback keeps a fixed square tile`, () => {
      const html = render({ ...COMPANY, logo: undefined });
      expect(html).toContain("size-");
      expect(html).not.toContain("object-contain");
    });
  }

  it("editor thumbnail preserves aspect ratio (no object-cover crop)", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, editorProps),
    );
    expect(html).toContain("object-contain");
    expect(html).toContain("w-auto");
    expect(html).toContain("max-w-44");
    expect(html).not.toContain("object-cover");
    expect(html).not.toContain("size-20");
  });

  it("editor copy no longer claims only square logos work", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardCompanyIdentitySettings, editorProps),
    );
    expect(html).not.toContain("A square image works best");
    expect(html).toContain("keeps its proportions");
  });
});
