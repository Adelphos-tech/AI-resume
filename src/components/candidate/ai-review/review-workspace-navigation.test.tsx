// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";

import { ReviewWorkspace } from "./review-workspace";

const reviewFixture = {
  schemaVersion: 1 as const,
  overall: {
    status: "good_foundation" as const,
    summary: "Test fixture summary — not a real review result.",
  },
  findings: [
    {
      blockId: "blk-exp-1",
      quote: "self-serve dashboards",
      status: "strong" as const,
      dimension: "achievement" as const,
      reason: "Fixture reason text.",
      guidance: "Fixture guidance text.",
    },
  ],
  gaps: [],
};

const reviewAction = vi.fn(async (raw: unknown) => {
  void raw;
  return { success: true as const, review: reviewFixture };
});

vi.mock("@/app/candidate/(workspace)/ai-review/actions", () => ({
  candidateReviewResumeAction: (raw: unknown) => reviewAction(raw),
}));

function setup() {
  return render(
    createElement(ReviewWorkspace, {
      variantId: "v-1",
      targetRole: "PM",
      targetCountry: "Canada",
      preview: createElement(
        "div",
        null,
        createElement(
          "div",
          { "data-resume-block-id": "blk-exp-1" },
          "Shipped self-serve dashboards that lifted weekly usage.",
        ),
        createElement(
          "div",
          { "data-resume-block-id": "blk-exp-2" },
          "Reduced payment failure rates.",
        ),
      ),
    }),
  );
}

describe("ReviewWorkspace evidence navigation", () => {
  beforeEach(() => {
    // jsdom lacks scrollIntoView/matchMedia — stub so calls are observable.
    Element.prototype.scrollIntoView = vi.fn();
    window.matchMedia = (() => ({ matches: false })) as never;
  });
  afterEach(cleanup);

  it("activates the correct resume block when a finding is located", async () => {
    setup();
    fireEvent.click(
      await screen.findByRole("button", { name: /review with ai/i }),
    );
    const locateBtn = await screen.findByRole("button", {
      name: /view finding in resume/i,
    });
    fireEvent.click(locateBtn);

    const block = document.querySelector('[data-resume-block-id="blk-exp-1"]');
    expect(block).not.toBeNull();
    expect(block!.classList.contains("resume-block-active")).toBe(true);
    // The block itself is asked to scroll into view (nearest scrollable
    // ancestor handles the container scroll in a real browser).
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    const other = document.querySelector('[data-resume-block-id="blk-exp-2"]');
    expect(other!.classList.contains("resume-block-active")).toBe(false);
  });

  it("reports gracefully when exact-quote highlighting is unsupported", async () => {
    // jsdom has no CSS Custom Highlight API — this exercises the
    // unsupported-browser path without faking it.
    setup();
    fireEvent.click(
      await screen.findByRole("button", { name: /review with ai/i }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /view finding in resume/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/exact phrase highlighting isn.?t available/i),
      ).toBeTruthy(),
    );
  });

  it("keeps the active block marked when zoom changes", async () => {
    setup();
    fireEvent.click(
      await screen.findByRole("button", { name: /review with ai/i }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /view finding in resume/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const block = document.querySelector('[data-resume-block-id="blk-exp-1"]');
    expect(block!.classList.contains("resume-block-active")).toBe(true);
  });
});
