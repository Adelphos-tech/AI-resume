import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PublicProfileSettings } from "./public-profile-settings";

const BASE_PROPS = {
  slug: "test-slug",
  isPublished: false,
  shareUrl: null as string | null,
  publicUrl: "/u/test-slug" as string | null,
  initial: null,
  variants: [] as {
    id: string;
    name: string;
    targetRole: string;
    targetCountry: string;
  }[],
  photoUrl: null as string | null,
  displayName: "QA Tester",
  photoKey: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverUrl: null as string | null,
  coverKey: null as string | null,
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
};

describe("PublicProfileSettings — step visibility", () => {
  it("renders Photos section in Basics step", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "basics",
      }),
    );
    expect(html).toContain('id="pp-photos"');
    expect(html).toContain("Profile photo");
    expect(html).toContain("Cover photo");
    // The Photos section should not be hidden when Basics is active
    const photosMatch = html.match(
      /<section[^>]*aria-labelledby="pp-photos"[^>]*>/,
    );
    expect(photosMatch).toBeTruthy();
    const photosSection = photosMatch![0];
    expect(photosSection).not.toContain("hidden");
  });

  it("hides Photos section in Design step", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "design",
      }),
    );
    // Photos section should have hidden class when Design is active
    const photosMatch = html.match(
      /<section[^>]*aria-labelledby="pp-photos"[^>]*>/,
    );
    expect(photosMatch).toBeTruthy();
    const photosSection = photosMatch![0];
    expect(photosSection).toContain("hidden");
  });

  it("renders Design controls in Design step", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "design",
      }),
    );
    expect(html).toContain('id="pp-appearance"');
    expect(html).toContain("Career Card Appearance");
    expect(html).toContain("Career Card theme");
    expect(html).toContain("Accent color");
    expect(html).toContain("Card Style");
    // Design section should not be hidden when Design is active
    const designMatch = html.match(
      /<section[^>]*aria-labelledby="pp-appearance"[^>]*>/,
    );
    expect(designMatch).toBeTruthy();
    const designSection = designMatch![0];
    expect(designSection).not.toContain("hidden");
  });

  it("hides Design controls in Basics step", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "basics",
      }),
    );
    // Design section should have hidden class when Basics is active
    const designMatch = html.match(
      /<section[^>]*aria-labelledby="pp-appearance"[^>]*>/,
    );
    expect(designMatch).toBeTruthy();
    const designSection = designMatch![0];
    expect(designSection).toContain("hidden");
  });

  it("shows Adjust cover button when cover exists", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "basics",
        coverUrl: "/u/test-slug/cover",
        coverKey: "cover-key-123",
      }),
    );
    expect(html).toContain("Adjust cover");
  });

  it("omits Adjust cover button when no cover exists", () => {
    const html = renderToStaticMarkup(
      createElement(PublicProfileSettings, {
        ...BASE_PROPS,
        activeStep: "basics",
        coverUrl: null,
        coverKey: null,
      }),
    );
    expect(html).not.toContain("Adjust cover");
  });
});
