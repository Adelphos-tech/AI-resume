import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardIdentity } from "./career-card-identity";
import { cardStyleTokens } from "@/lib/career-card-theme-styles";

const BASE_PROPS = {
  name: "QA Tester",
  headline: "Senior Engineer",
  photoUrl: null as string | null,
  coverUrl: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  initials: "QT",
  openToOpportunities: false,
};

describe("CareerCardIdentity", () => {
  it("renders display name and headline", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens,
      }),
    );
    expect(html).toContain("QA Tester");
    expect(html).toContain("Senior Engineer");
  });

  it("renders initials when photoUrl is null", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        photoUrl: null,
        tokens,
      }),
    );
    expect(html).toContain("QT");
  });

  it("renders profile photo when photoUrl is provided", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        photoUrl: "/u/test/photo",
        tokens,
      }),
    );
    expect(html).toContain("/u/test/photo");
  });

  it("renders cover photo when coverUrl is provided", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        tokens,
      }),
    );
    expect(html).toContain("/u/test/cover");
  });

  it("omits cover when showCover is false", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        tokens,
        showCover: false,
      }),
    );
    expect(html).not.toContain("/u/test/cover");
  });

  it("applies avatar pull when coverUrl is truthy even if showCover is false", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        tokens,
        showCover: false,
      }),
    );
    // Public page renders cover outside CareerCardIdentity but still needs
    // the avatar to overlap it.
    expect(html).toContain("-mt-14");
  });

  it("shows Open to opportunities badge when true", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        openToOpportunities: true,
        tokens,
      }),
    );
    expect(html).toContain("Open to opportunities");
  });

  it("omits Open to opportunities badge when false", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        openToOpportunities: false,
        tokens,
      }),
    );
    expect(html).not.toContain("Open to opportunities");
  });

  it("renders builder badge when provided", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens,
        builderBadge: createElement(
          "span",
          { className: "builder-badge" },
          "Not published",
        ),
      }),
    );
    expect(html).toContain("Not published");
    expect(html).toContain("builder-badge");
  });

  it("renders inline location and focus", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens,
        location: "Berlin",
        currentFocus: "AI Strategy",
      }),
    );
    expect(html).toContain("Berlin");
    expect(html).toContain("AI Strategy");
  });

  it("applies different tokens for executive-dark theme", () => {
    const classicTokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const execTokens = cardStyleTokens(
      "executive-dark",
      "emerald",
      "standard",
    ).base;

    const classicHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens: classicTokens,
      }),
    );
    const execHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens: execTokens,
      }),
    );

    // Executive dark uses bg-stone-950 page, different avatar style
    expect(classicHtml).toContain("text-stone-900");
    expect(execHtml).toContain("text-white");
  });

  it("applies different accent tokens", () => {
    const emeraldTokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const redTokens = cardStyleTokens(
      "role-race-classic",
      "red",
      "standard",
    ).base;

    const emeraldHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens: emeraldTokens,
      }),
    );
    const redHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens: redTokens,
      }),
    );

    // Accent changes affect avatar ring and other accent-colored elements
    expect(emeraldHtml).not.toBe(redHtml);
  });

  it("uses theme cover wrap height for standard style", () => {
    const classicTokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const corporateTokens = cardStyleTokens(
      "corporate-clean",
      "emerald",
      "standard",
    ).base;

    const classicHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/cover",
        tokens: classicTokens,
      }),
    );
    const corpHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/cover",
        tokens: corporateTokens,
      }),
    );

    // Classic uses sm:h-48, corporate uses sm:h-28
    expect(classicHtml).toContain("sm:h-48");
    expect(corpHtml).toContain("sm:h-28");
  });

  it("uses theme avatar pull class", () => {
    const classicTokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const execTokens = cardStyleTokens(
      "executive-dark",
      "emerald",
      "standard",
    ).base;

    const classicHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/cover",
        tokens: classicTokens,
      }),
    );
    const execHtml = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        coverUrl: "/cover",
        tokens: execTokens,
      }),
    );

    expect(classicHtml).toContain("-mt-14");
    expect(execHtml).toContain("-mt-16");
  });

  it("accepts custom content layout className", () => {
    const tokens = cardStyleTokens(
      "role-race-classic",
      "emerald",
      "standard",
    ).base;
    const html = renderToStaticMarkup(
      createElement(CareerCardIdentity, {
        ...BASE_PROPS,
        tokens,
        contentClassName: "my-custom-layout",
      }),
    );
    expect(html).toContain("my-custom-layout");
  });
});

import { CareerCardBuilderPreview } from "./career-card-builder-preview";

describe("CareerCardIdentity — Builder preview integration", () => {
  it("Builder preview renders CareerCardIdentity", () => {
    const el = createElement(CareerCardBuilderPreview, {
      state: {
        publicHeadline: "Test",
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
      },
      displayName: "Test",
      photoUrl: null,
      coverUrl: null,
      photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      isPublished: false,
    });
    const html = renderToStaticMarkup(el);
    // Builder preview should use the shared component (theme tokens, not
    // the old hardcoded approximation).
    expect(html).toContain("text-stone-900");
    expect(html).not.toContain("border-4 border-white"); // old hardcoded avatar frame
    expect(html).not.toContain("-mt-10"); // old hardcoded avatar pull
  });
});
