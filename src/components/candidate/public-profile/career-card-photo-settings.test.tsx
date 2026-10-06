import { describe, it, expect, vi } from "vitest";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardPhotoSettings } from "./career-card-photo-settings";

const BASE_PROPS = {
  displayName: "QA Tester",
  photoUrl: null as string | null,
  photoKey: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  photoVersion: 0,
  photoBusy: false,
  photoMessage: null as string | null,
  coverUrl: null as string | null,
  coverKey: null as string | null,
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverVersion: 0,
  coverBusy: false,
  coverMessage: null as string | null,
  coverWrapClass: "relative h-40 w-full sm:h-48",
  fileInputRef: createRef<HTMLInputElement>(),
  coverInputRef: createRef<HTMLInputElement>(),
  adjustPhotoBtnRef: createRef<HTMLButtonElement>(),
  adjustCoverBtnRef: createRef<HTMLButtonElement>(),
  onPhotoFileSelect: vi.fn(),
  onRemovePhoto: vi.fn(),
  onCoverFileSelect: vi.fn(),
  onRemoveCover: vi.fn(),
  onAdjustPhoto: vi.fn(),
  onAdjustCover: vi.fn(),
};

describe("CareerCardPhotoSettings", () => {
  it("renders profile photo section", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, BASE_PROPS),
    );
    expect(html).toContain("Profile photo");
    expect(html).toContain("Upload photo");
  });

  it("renders cover photo section", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, BASE_PROPS),
    );
    expect(html).toContain("Cover photo");
    expect(html).toContain("Upload cover");
  });

  it("shows replace when photo exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        photoUrl: "/u/test/photo",
      }),
    );
    expect(html).toContain("Replace photo");
  });

  it("shows replace when cover exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
      }),
    );
    expect(html).toContain("Replace cover");
  });

  it("shows Adjust photo when photo and key exist", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        photoUrl: "/u/test/photo",
        photoKey: "key-123",
      }),
    );
    expect(html).toContain("Adjust photo");
  });

  it("shows Adjust cover when cover and key exist", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        coverKey: "key-123",
      }),
    );
    expect(html).toContain("Adjust cover");
  });

  it("shows Remove for photo when photo exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        photoUrl: "/u/test/photo",
      }),
    );
    expect(html).toContain("Remove");
  });

  it("shows Remove for cover when cover exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
      }),
    );
    expect(html).toContain("Remove");
  });

  it("omits Adjust cover when no cover key", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        coverKey: null,
      }),
    );
    expect(html).not.toContain("Adjust cover");
  });

  it("renders initials fallback when photoUrl is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, BASE_PROPS),
    );
    expect(html).toContain("QT");
  });

  it("does not use fixed-width containers", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardPhotoSettings, BASE_PROPS),
    );
    expect(html).not.toMatch(/style="[^"]*width:\s*\d+px/);
    expect(html).not.toMatch(/class="[^"]*w-\[\d+px\]/);
  });
});
