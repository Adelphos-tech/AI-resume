import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardBuilderPreview } from "./career-card-builder-preview";
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

const BASE_PROPS = {
  displayName: "QA Tester",
  photoUrl: null as string | null,
  coverUrl: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  isPublished: false,
};

describe("CareerCardBuilderPreview", () => {
  it("renders display name when headline is empty", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
      }),
    );
    expect(html).toContain("QA Tester");
  });

  it("renders headline from state when provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, publicHeadline: "Senior Engineer" },
      }),
    );
    expect(html).toContain("Senior Engineer");
  });

  it("renders location from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, publicLocation: "Berlin" },
      }),
    );
    expect(html).toContain("Berlin");
  });

  it("renders current focus from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, currentFocus: "AI Strategy" },
      }),
    );
    expect(html).toContain("AI Strategy");
  });

  it("shows Not published badge when isPublished is false", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        isPublished: false,
      }),
    );
    expect(html).toContain("Not published");
  });

  it("shows Open to opportunities badge when published and open", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, openToOpportunities: true },
        isPublished: true,
      }),
    );
    expect(html).toContain("Open to opportunities");
  });

  it("omits Open to opportunities badge when unpublished even if open", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, openToOpportunities: true },
        isPublished: false,
      }),
    );
    expect(html).not.toContain("Open to opportunities");
  });

  it("renders fallback message when state is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: null,
      }),
    );
    expect(html).toContain("Create your Career Card to see a preview");
  });

  it("applies different cover wrap class for executive-dark theme", () => {
    const classicHtml = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        state: { ...DEFAULT_STATE, themeId: "role-race-classic" },
      }),
    );
    const darkHtml = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        state: { ...DEFAULT_STATE, themeId: "executive-dark" },
      }),
    );
    // executive-dark cover wrap is taller (sm:h-60 vs sm:h-48)
    expect(classicHtml).toContain("sm:h-48");
    expect(darkHtml).toContain("sm:h-60");
  });

  it("renders photo when photoUrl is provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        photoUrl: "/u/test/photo",
      }),
    );
    expect(html).toContain("/u/test/photo");
  });

  it("renders cover when coverUrl is provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        coverUrl: "/u/test/cover",
      }),
    );
    expect(html).toContain("/u/test/cover");
  });

  it("renders initials when photoUrl is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        photoUrl: null,
      }),
    );
    expect(html).toContain("QT");
  });

  // ── Theme-specific preview branches ────────────────────────────────

  it("Classic selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "role-race-classic" },
      }),
    );
    // Standard card uses text-stone-900 from classic tokens
    expect(html).toContain("text-stone-900");
    // Should NOT render NFC Compact
    expect(html).not.toContain("NFC Career Card");
  });

  it("Corporate selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "corporate-clean" },
      }),
    );
    // Corporate uses rounded-md avatar
    expect(html).toContain("rounded-md");
    expect(html).not.toContain("NFC Career Card");
  });

  it("Executive Dark selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "executive-dark" },
      }),
    );
    // Executive dark uses text-white for name
    expect(html).toContain("text-white");
    expect(html).not.toContain("NFC Career Card");
  });

  it("Tech Minimal selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "tech-minimal" },
      }),
    );
    // Tech uses font-mono
    expect(html).toContain("font-mono");
    expect(html).not.toContain("NFC Career Card");
  });

  it("NFC Compact selection renders NFC preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
      }),
    );
    expect(html).toContain("NFC Career Card");
    // Should NOT render generic CareerCardIdentity classes
    expect(html).not.toContain("text-stone-900");
  });

  it("NFC Compact Career Passport skin renders correct preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "career-passport",
        },
      }),
    );
    // Career Passport uses light bg
    expect(html).toContain("bg-[#fafaf9]");
    expect(html).toContain("NFC Career Card");
  });

  it("NFC Compact Crimson Night skin renders dark preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "crimson-night",
        },
      }),
    );
    // Crimson Night uses dark base variable
    expect(html).toContain("bg-[var(--cn-base)]");
    expect(html).toContain("NFC Career Card");
    // Should differ from Career Passport light bg
    expect(html).not.toContain("bg-[#fafaf9]");
  });

  it("NFC Compact preview shows Not published badge when unpublished", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
        isPublished: false,
      }),
    );
    expect(html).toContain("Not published");
  });

  it("NFC Compact preview omits Not published badge when published", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
        isPublished: true,
      }),
    );
    expect(html).not.toContain("Not published");
  });

  it("NFC Compact preview uses accent color from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          accentColorId: "red",
        },
      }),
    );
    // nfcCompactAccentStyle with red accent sets --nfc-cta
    expect(html).toContain("--nfc-cta");
  });
});
