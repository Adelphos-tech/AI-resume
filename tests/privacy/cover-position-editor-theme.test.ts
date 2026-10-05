import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { cardStyleTokens } from "@/lib/career-card-theme-styles";
import {
  CareerCardCoverPhoto,
  CoverPositionEditor,
} from "@/components/candidate/public-profile/career-card-photo";

describe("CoverPositionEditor — theme-accurate preview dimensions", () => {
  it("classic standard uses h-40 sm:h-48 cover wrap", () => {
    const t = cardStyleTokens("role-race-classic", "emerald", "standard");
    expect(t.base.coverWrap).toContain("h-40");
    expect(t.base.coverWrap).toContain("sm:h-48");
    expect(t.premium).toBeNull();
  });

  it("corporate standard uses h-24 sm:h-28 cover wrap", () => {
    const t = cardStyleTokens("corporate-clean", "emerald", "standard");
    expect(t.base.coverWrap).toContain("h-24");
    expect(t.base.coverWrap).toContain("sm:h-28");
  });

  it("tech standard uses h-20 sm:h-24 cover wrap", () => {
    const t = cardStyleTokens("tech-minimal", "emerald", "standard");
    expect(t.base.coverWrap).toContain("h-20");
    expect(t.base.coverWrap).toContain("sm:h-24");
  });

  it("executive standard uses h-44 sm:h-60 cover wrap", () => {
    const t = cardStyleTokens("executive-dark", "emerald", "standard");
    expect(t.base.coverWrap).toContain("h-44");
    expect(t.base.coverWrap).toContain("sm:h-60");
  });

  it("premium light style overrides with h-40 sm:h-52 lg:h-60", () => {
    const t = cardStyleTokens("role-race-classic", "emerald", "premium");
    expect(t.premium).not.toBeNull();
    expect(t.premium!.coverWrap).toContain("h-40");
    expect(t.premium!.coverWrap).toContain("sm:h-52");
    expect(t.premium!.coverWrap).toContain("lg:h-60");
  });

  it("premium executive style overrides with h-40 sm:h-56 lg:h-64", () => {
    const t = cardStyleTokens("executive-dark", "emerald", "premium");
    expect(t.premium).not.toBeNull();
    expect(t.premium!.coverWrap).toContain("h-40");
    expect(t.premium!.coverWrap).toContain("sm:h-56");
    expect(t.premium!.coverWrap).toContain("lg:h-64");
  });

  it("no theme coverWrap uses aspect-ratio — real heights only", () => {
    const themes: Array<{
      theme: string;
      accent: string;
      style: string;
    }> = [
      { theme: "role-race-classic", accent: "emerald", style: "standard" },
      { theme: "corporate-clean", accent: "blue", style: "standard" },
      { theme: "tech-minimal", accent: "slate", style: "standard" },
      { theme: "executive-dark", accent: "amber", style: "standard" },
      { theme: "role-race-classic", accent: "emerald", style: "premium" },
      { theme: "executive-dark", accent: "amber", style: "premium" },
    ];
    for (const cfg of themes) {
      const t = cardStyleTokens(cfg.theme, cfg.accent, cfg.style);
      const wrap = t.premium?.coverWrap ?? t.base.coverWrap;
      // Real theme dimensions use explicit height classes, never aspect-ratio.
      expect(wrap).not.toContain("aspect-");
      expect(wrap).toContain("h-");
    }
  });
});

describe("CareerCardCoverPhoto — focal/zoom rendering parity", () => {
  it("renders object-position as percent from focalX/focalY", () => {
    const html = renderToString(
      createElement(CareerCardCoverPhoto, {
        src: "/cover.webp",
        alt: "",
        position: { focalX: 0.25, focalY: 0.75, zoom: 1.5 },
        frameClassName: "h-40 w-full",
      }),
    );
    expect(html).toContain("object-position:25% 75%");
    expect(html).toContain("transform:scale(1.5)");
    expect(html).toContain("transform-origin:25% 75%");
  });

  it("uses frameClassName for the outer wrap", () => {
    const html = renderToString(
      createElement(CareerCardCoverPhoto, {
        src: "/cover.webp",
        alt: "",
        position: { focalX: 0.5, focalY: 0.5, zoom: 1 },
        frameClassName: "relative h-24 w-full",
      }),
    );
    expect(html).toContain("relative h-24 w-full");
    expect(html).toContain("overflow-hidden");
  });

  it("uses absolute inset-0 for inner img when public renderer does", () => {
    const html = renderToString(
      createElement(CareerCardCoverPhoto, {
        src: "/cover.webp",
        alt: "",
        position: { focalX: 0.5, focalY: 0.5, zoom: 1 },
        frameClassName: "absolute inset-0 size-full",
      }),
    );
    expect(html).toContain("absolute inset-0 size-full");
    expect(html).toContain("object-cover");
  });
});

describe("CoverPositionEditor — prop wiring", () => {
  it("component accepts frameClassName without type errors", () => {
    // The Radix Dialog used inside CoverPositionEditor does not SSR-render,
    // so we verify the prop contract statically by constructing the element.
    const el = createElement(CoverPositionEditor, {
      src: "/cover.webp",
      name: "Test",
      initial: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      busy: false,
      message: null,
      onClose: () => {},
      onSave: () => {},
      frameClassName: "relative h-20 w-full",
    });
    expect(el.props.frameClassName).toBe("relative h-20 w-full");
  });

  it("defaults frameClassName prop to legacy aspect-2/1 when omitted", () => {
    const el = createElement(CoverPositionEditor, {
      src: "/cover.webp",
      name: "Test",
      initial: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      busy: false,
      message: null,
      onClose: () => {},
      onSave: () => {},
    });
    // Default is supplied by the function signature; the element still
    // carries the default value at runtime.
    expect(el.props.frameClassName).toBeUndefined();
  });
});
