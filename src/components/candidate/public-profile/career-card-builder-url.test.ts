import { describe, it, expect } from "vitest";

/** Mirrors the cache-busting logic in CareerCardBuilderPageClient. */
function effectiveImageUrl(url: string | null, version: number): string | null {
  if (!url) return null;
  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
}

describe("CareerCardBuilderPageClient image URL cache-busting", () => {
  it("appends ?v=1 for a clean URL", () => {
    expect(effectiveImageUrl("/u/test/photo", 1)).toBe("/u/test/photo?v=1");
  });

  it("appends &v=2 when URL already has a query string", () => {
    expect(effectiveImageUrl("/u/test/photo?w=200", 2)).toBe(
      "/u/test/photo?w=200&v=2",
    );
  });

  it("returns null when url is null", () => {
    expect(effectiveImageUrl(null, 1)).toBeNull();
  });

  it("increments version produce different URLs", () => {
    const url = "/u/test/photo";
    const v1 = effectiveImageUrl(url, 1);
    const v2 = effectiveImageUrl(url, 2);
    expect(v1).toBe("/u/test/photo?v=1");
    expect(v2).toBe("/u/test/photo?v=2");
    expect(v1).not.toBe(v2);
  });
});
