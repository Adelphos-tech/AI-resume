import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewWorkspace } from "./review-workspace";

function render() {
  return renderToStaticMarkup(
    createElement(ReviewWorkspace, {
      variantId: "v-1",
      targetRole: "Engineer",
      targetCountry: "Canada",
      preview: createElement("div", { "data-resume-block-id": "b1" }, "Résumé"),
    }),
  );
}

describe("ReviewWorkspace layout", () => {
  it("uses a resume-first two-column layout at lg+", () => {
    const html = render();
    // Wider resume column (7fr) on the left, review column (5fr) on the right
    expect(html).toContain("lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]");
    // Resume pane pinned to the left column and sticky
    expect(html).toContain("lg:col-start-1");
    expect(html).toContain("lg:sticky");
  });

  it("gives the resume document an independently scrollable viewport at lg+", () => {
    const html = render();
    expect(html).toContain("lg:max-h-[calc(100dvh-11rem)]");
    expect(html).toContain("overflow-auto");
  });

  it("exposes pane anchors and a mobile switcher hidden at lg+", () => {
    const html = render();
    expect(html).toContain('id="ai-review-pane"');
    expect(html).toContain('id="resume-pane"');
    expect(html).toContain('href="#ai-review-pane"');
    expect(html).toContain('href="#resume-pane"');
    expect(html).toContain('aria-label="Review workspace sections"');
    expect(html).toContain("lg:hidden");
  });

  it("renders zoom controls with a reset action", () => {
    const html = render();
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain('aria-label="Reset zoom to 100 percent"');
    expect(html).toContain('aria-label="Open resume preview fullscreen"');
  });

  it("renders the preview content inside the resume pane", () => {
    const html = render();
    expect(html).toContain('data-resume-block-id="b1"');
    expect(html).toContain("Résumé");
  });
});
