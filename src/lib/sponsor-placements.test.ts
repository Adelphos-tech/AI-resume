import { describe, it, expect } from "vitest";
import {
  CONTENT_ANCHORS,
  DEFAULT_SPONSOR_PLACEMENT,
  isSponsorPlacement,
  resolveSponsorPlacement,
  SPONSOR_PLACEMENTS,
} from "./sponsor-placements";

describe("sponsor placement registry", () => {
  it("exposes all five curated anchors in canonical order", () => {
    expect(SPONSOR_PLACEMENTS.map((p) => p.id)).toEqual([
      "after-header",
      "after-bio",
      "after-content",
      "after-links",
      "before-footer",
    ]);
  });

  it("accepts only registry ids", () => {
    for (const p of SPONSOR_PLACEMENTS) {
      expect(isSponsorPlacement(p.id)).toBe(true);
    }
    expect(isSponsorPlacement("top")).toBe(false);
    expect(isSponsorPlacement("x: 100")).toBe(false);
    expect(isSponsorPlacement("<script>")).toBe(false);
    expect(isSponsorPlacement("")).toBe(false);
  });

  it("resolves NULL to the established default", () => {
    expect(DEFAULT_SPONSOR_PLACEMENT).toBe("before-footer");
    expect(resolveSponsorPlacement(null)).toBe("before-footer");
    expect(resolveSponsorPlacement(undefined)).toBe("before-footer");
    expect(resolveSponsorPlacement("")).toBe("before-footer");
  });

  it("resolves unknown ids defensively to the default", () => {
    expect(resolveSponsorPlacement("bogus")).toBe("before-footer");
    expect(resolveSponsorPlacement("AFTER-HEADER")).toBe("before-footer");
  });

  it("passes valid placements through unchanged", () => {
    expect(resolveSponsorPlacement("after-header")).toBe("after-header");
    expect(resolveSponsorPlacement("after-links")).toBe("after-links");
  });

  it("keeps content anchors distinct from the footer anchor", () => {
    expect(CONTENT_ANCHORS).not.toContain("before-footer");
    expect(CONTENT_ANCHORS).toHaveLength(4);
  });
});
