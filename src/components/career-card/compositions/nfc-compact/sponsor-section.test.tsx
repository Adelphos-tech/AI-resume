import { describe, it, expect } from "vitest";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildSponsorSlots,
  footerSponsors,
  SponsorSection,
} from "./sponsor-section";

const sponsor = (
  imageUrl: string,
  placement: string,
  url: string | null = null,
) =>
  ({
    imageUrl,
    url,
    placement,
  }) as Parameters<typeof buildSponsorSlots>[0] extends (infer T)[] ? T : never;

describe("SponsorSection", () => {
  it("renders nothing without sponsors", () => {
    expect(
      renderToStaticMarkup(createElement(SponsorSection, { sponsors: [] })),
    ).toBe("");
    expect(
      renderToStaticMarkup(createElement(SponsorSection, { sponsors: null })),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        createElement(SponsorSection, { sponsors: undefined }),
      ),
    ).toBe("");
  });

  it("labels the strip as sponsored content", () => {
    const html = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          { imageUrl: "/u/x/sponsor/1", url: null, placement: "before-footer" },
        ],
      }),
    );
    expect(html).toContain("Sponsored");
    expect(html).toContain('aria-label="Sponsored"');
  });

  it("renders an unlinked image when no URL is set", () => {
    const html = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          { imageUrl: "/u/x/sponsor/1", url: null, placement: "before-footer" },
        ],
      }),
    );
    expect(html).toContain('src="/u/x/sponsor/1"');
    expect(html).not.toContain("<a");
  });

  it("renders a safe sponsored link when a URL is set", () => {
    const html = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          {
            imageUrl: "/u/x/sponsor/1",
            url: "https://brand.example",
            placement: "before-footer",
          },
        ],
      }),
    );
    expect(html).toContain('href="https://brand.example"');
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("keeps each sponsor on its own saved URL", () => {
    const html = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          {
            imageUrl: "/u/x/sponsor/1",
            url: "https://one.example",
            placement: "before-footer",
          },
          {
            imageUrl: "/u/x/sponsor/2",
            url: "https://two.example",
            placement: "before-footer",
          },
        ],
      }),
    );
    expect(html).toContain('src="/u/x/sponsor/1"');
    expect(html).toContain('src="/u/x/sponsor/2"');
    expect(html).toContain('href="https://one.example"');
    expect(html).toContain('href="https://two.example"');
  });

  it("uses the dark surface tokens when requested", () => {
    const dark = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          { imageUrl: "/u/x/sponsor/1", url: null, placement: "before-footer" },
        ],
        variant: "dark",
      }),
    );
    expect(dark).toContain("border-white/10");
    const light = renderToStaticMarkup(
      createElement(SponsorSection, {
        sponsors: [
          { imageUrl: "/u/x/sponsor/1", url: null, placement: "before-footer" },
        ],
      }),
    );
    expect(light).not.toContain("border-white/10");
  });
});

describe("sponsor placement grouping", () => {
  it("splits independent placements into their own anchors", () => {
    const slots = buildSponsorSlots([
      sponsor("/u/x/sponsor/1", "after-header"),
      sponsor("/u/x/sponsor/2", "after-links"),
    ]);
    expect(isValidElement(slots["after-header"])).toBe(true);
    expect(isValidElement(slots["after-links"])).toBe(true);
    expect(slots["after-bio"]).toBeUndefined();
    expect(slots["after-content"]).toBeUndefined();
  });

  it("keeps both sponsors in one strip at the same anchor, order preserved", () => {
    const slots = buildSponsorSlots([
      sponsor("/u/x/sponsor/1", "after-bio"),
      sponsor("/u/x/sponsor/2", "after-bio"),
    ]);
    const html = renderToStaticMarkup(slots["after-bio"] as never);
    const first = html.indexOf("/u/x/sponsor/1");
    const second = html.indexOf("/u/x/sponsor/2");
    expect(first).toBeGreaterThan(-1);
    expect(second).toBeGreaterThan(first);
    expect(slots["after-header"]).toBeUndefined();
  });

  it("routes footer and unknown placements to the footer slot", () => {
    const list = [
      sponsor("/u/x/sponsor/1", "before-footer"),
      sponsor("/u/x/sponsor/2", "bogus-anchor"),
    ];
    expect(footerSponsors(list)).toHaveLength(2);
    const slots = buildSponsorSlots(list);
    expect(Object.keys(slots)).toHaveLength(0);
  });

  it("renders each sponsor exactly once across anchors", () => {
    const list = [
      sponsor("/u/x/sponsor/1", "after-header"),
      sponsor("/u/x/sponsor/2", "before-footer"),
    ];
    const slots = buildSponsorSlots(list);
    const seen = [
      ...Object.values(slots).filter(Boolean),
      createElement(SponsorSection, { sponsors: footerSponsors(list) }),
    ];
    const html = seen.map((el) => renderToStaticMarkup(el as never)).join("");
    expect(html.match(/sponsor\/1/g)).toHaveLength(1);
    expect(html.match(/sponsor\/2/g)).toHaveLength(1);
  });
});
