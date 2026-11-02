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

import { CandidateAiReviewPanel } from "./review-panel";

const WORK_ENTRY = "11111111-2222-4333-8444-555555555555";

const reviewFixture = {
  schemaVersion: 1 as const,
  overall: {
    status: "good_foundation" as const,
    summary: "Test fixture summary — not a real review result.",
  },
  findings: [
    {
      blockId: `work:${WORK_ENTRY}:highlight:0`,
      quote: "dashboards",
      status: "strong" as const,
      dimension: "achievement" as const,
      reason: "Fixture strong reason.",
      guidance: "Fixture strong guidance.",
    },
    {
      blockId: "blk-2",
      quote: "failure rates",
      status: "weak" as const,
      dimension: "evidence" as const,
      reason: "Fixture weak reason.",
      guidance: "Fixture weak guidance.",
    },
  ],
  gaps: [
    {
      category: "certifications",
      reason: "Fixture gap reason.",
      guidance: "Fixture gap guidance.",
    },
  ],
};

const reviewAction = vi.fn(async (raw: unknown) => {
  void raw;
  return { success: true as const, review: reviewFixture };
});

vi.mock("@/app/candidate/(workspace)/ai-review/actions", () => ({
  candidateReviewResumeAction: (raw: unknown) => reviewAction(raw),
}));

const noop = () => {};

function setup(blockExists: (id: string) => boolean = () => true) {
  return render(
    createElement(CandidateAiReviewPanel, {
      variantId: "v-1",
      targetRole: "Senior PM",
      targetCountry: "Canada",
      activeBlockId: null,
      missingBlock: false,
      quoteStatus: "none",
      blockExists,
      onLocate: noop,
      onNewResult: noop,
      onReviewReady: noop,
      onPendingChange: noop,
    }),
  );
}

async function runReview() {
  fireEvent.click(
    await screen.findByRole("button", { name: /review with ai/i }),
  );
  await waitFor(() => screen.getByText(/fixture summary/i));
}

describe("CandidateAiReviewPanel results", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.matchMedia = (() => ({ matches: false })) as never;
  });
  afterEach(cleanup);

  it("shows review context and real counts in the overview", async () => {
    setup();
    await runReview();
    expect(
      screen.getByText(/reviewed against: senior pm · canada/i),
    ).toBeTruthy();
    expect(screen.getByText("2 findings")).toBeTruthy();
    expect(screen.getByText("1 gaps")).toBeTruthy();
  });

  it("labels finding sections with the approved plain-language labels", async () => {
    setup();
    await runReview();
    // first finding opens by default in "What's working"
    expect(screen.getByText("What we found")).toBeTruthy();
    expect(screen.getByText("Why it matters")).toBeTruthy();
    expect(screen.getByText("How to improve")).toBeTruthy();
  });

  it("labels gap cards and keeps missing-evidence distinction", async () => {
    setup();
    await runReview();
    expect(screen.getByText(/not proof you lack them/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /missing evidence/i }));
    expect(screen.getByText("What you could add")).toBeTruthy();
  });

  it("filters findings by dimension with an accurate count", async () => {
    setup();
    await runReview();
    fireEvent.change(screen.getByLabelText(/filter by dimension/i), {
      target: { value: "evidence" },
    });
    expect(screen.getByText(/1 of 2 findings/)).toBeTruthy();
    // the now-empty "What's working" section disappears entirely
    expect(
      screen.queryByRole("button", { name: /what's working/i }),
    ).toBeNull();
  });

  it("shows a fallback instead of a misleading locate action when the block is missing", async () => {
    setup(() => false);
    await runReview();
    fireEvent.click(
      screen.getByRole("button", { name: /needs strengthening/i }),
    );
    expect(screen.getAllByText("Not shown in preview").length).toBe(2);
    expect(
      screen.queryByRole("button", { name: /view finding in resume/i }),
    ).toBeNull();
  });

  it("fires exactly one review request per click and none on mount", async () => {
    setup();
    expect(reviewAction.mock.calls.length).toBe(0);
    await runReview();
    expect(reviewAction.mock.calls.length).toBe(1);
  });

  it("sends the job description and switches to job-specific mode", async () => {
    setup();
    expect(screen.getByText("0/8000")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: "Hiring a PM with analytics depth" },
    });
    expect(
      screen.getByText("Review against your job description"),
    ).toBeTruthy();
    await runReview();
    expect(reviewAction.mock.calls.at(-1)?.[0]).toEqual({
      variantId: "v-1",
      jobDescription: "Hiring a PM with analytics depth",
    });
    expect(screen.getByText(/your job description/i)).toBeTruthy();
  });

  it("sends no job description and stays in general mode when empty", async () => {
    setup();
    expect(screen.getByText("Review for your target role")).toBeTruthy();
    await runReview();
    expect(reviewAction.mock.calls.at(-1)?.[0]).toEqual({
      variantId: "v-1",
      jobDescription: undefined,
    });
    expect(screen.queryByText(/your job description/i)).toBeNull();
  });

  it("keeps the job description text and retry action after a failure", async () => {
    reviewAction.mockResolvedValueOnce({
      success: false,
      message: "Fixture failure.",
    } as never);
    setup();
    const jd = screen.getByLabelText(/job description/i) as HTMLTextAreaElement;
    fireEvent.change(jd, { target: { value: "JD text preserved" } });
    fireEvent.click(
      await screen.findByRole("button", { name: /review with ai/i }),
    );
    await waitFor(() => screen.getByRole("alert"));
    expect(jd.value).toBe("JD text preserved");
    expect(
      screen.getByRole("button", { name: /review with ai/i }),
    ).toBeTruthy();
  });

  it("links a resolvable finding to its Career Profile entry in a new tab", async () => {
    setup();
    await runReview();
    const link = screen.getByRole("link", {
      name: /edit career profile/i,
    });
    expect(link.getAttribute("href")).toBe(
      `/candidate/profile?section=work&entry=${WORK_ENTRY}`,
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("hides the edit link when the block id cannot be resolved", async () => {
    setup();
    await runReview();
    fireEvent.click(
      screen.getByRole("button", { name: /needs strengthening/i }),
    );
    // blk-2 is not a canonical composer id — no misleading edit action
    expect(
      screen.queryAllByRole("link", { name: /edit career profile/i }).length,
    ).toBe(1);
  });

  it("copies finding guidance to the clipboard", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    setup();
    await runReview();
    fireEvent.click(
      screen.getAllByRole("button", { name: /copy guidance/i })[0],
    );
    expect(writeText).toHaveBeenCalledWith("Fixture strong guidance.");
    await screen.findByText("Copied");
  });
});
