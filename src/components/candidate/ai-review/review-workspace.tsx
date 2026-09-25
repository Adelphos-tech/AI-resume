"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CandidateAiReviewPanel } from "@/components/candidate/ai-review/review-panel";
import type { AiResumeReview } from "@/server/ai/resume-review-schema";

const QUOTE_HIGHLIGHT_NAME = "rolerace-ai-quote";
const POSITIVE_HIGHLIGHT_NAME = "rolerace-review-positive";
const IMPROVE_HIGHLIGHT_NAME = "rolerace-review-improve";

export type QuoteStatus = "none" | "unsupported" | "not-found" | "ok";

type Annotation = {
  key: string;
  blockId: string;
  quote: string;
  label: string;
  improvement: boolean;
  top: number;
};

/**
 * Collect the block's text nodes and build a global-offset map so an
 * exact quote string can be located deterministically, even when it
 * spans multiple DOM text nodes.
 */
function quoteRangesInBlock(block: Element, quote: string): Range[] {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const segs: { node: Text; start: number; end: number }[] = [];
  let text = "";
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    segs.push({
      node,
      start: text.length,
      end: text.length + node.data.length,
    });
    text += node.data;
  }

  const ranges: Range[] = [];
  let idx = text.indexOf(quote);
  while (idx !== -1) {
    const end = idx + quote.length;
    const s = segs.find((x) => idx >= x.start && idx < x.end);
    const e = segs.find((x) => end > x.start && end <= x.end);
    if (s && e) {
      const r = new Range();
      r.setStart(s.node, idx - s.start);
      r.setEnd(e.node, end - e.start);
      ranges.push(r);
    }
    idx = text.indexOf(quote, idx + 1);
  }
  return ranges;
}

/** Both capabilities must be present and usable for quote ranges. */
function quoteHighlightSupported(): boolean {
  return (
    "highlights" in CSS && !!CSS.highlights && typeof Highlight !== "undefined"
  );
}

function findBlock(root: HTMLElement, blockId: string): Element | undefined {
  return Array.from(root.querySelectorAll("[data-resume-block-id]")).find(
    (el) => (el as HTMLElement).dataset.resumeBlockId === blockId,
  );
}

/**
 * Client coordinator for the candidate AI Review workspace. Owns
 * pending/active/annotation state, applies the `resume-block-active`
 * whole-block treatment to the exact data-resume-block-id element, and
 * registers CSS Custom Highlights: passive per-status annotations for
 * every anchored finding plus a stronger exact-quote highlight for the
 * selected finding. Browser state is never authoritative for persisted
 * resume data.
 */
export function ReviewWorkspace({
  variantId,
  targetRole,
  targetCountry,
  preview,
}: {
  variantId: string;
  targetRole: string;
  targetCountry: string;
  preview: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [active, setActive] = useState<{
    blockId: string;
    quote: string;
  } | null>(null);
  const [missingBlock, setMissingBlock] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("none");

  /** Clears only the selected-finding treatment (block class + quote). */
  const clearActiveDom = useCallback(() => {
    rootRef.current
      ?.querySelectorAll("[data-resume-block-id]")
      .forEach((el) => el.classList.remove("resume-block-active"));
    if (quoteHighlightSupported()) {
      CSS.highlights.delete(QUOTE_HIGHLIGHT_NAME);
    }
  }, []);

  /** Clears everything, including passive annotation groups. */
  const clearDom = useCallback(() => {
    clearActiveDom();
    if (quoteHighlightSupported()) {
      CSS.highlights.delete(POSITIVE_HIGHLIGHT_NAME);
      CSS.highlights.delete(IMPROVE_HIGHLIGHT_NAME);
    }
  }, [clearActiveDom]);

  const reset = useCallback(() => {
    setActive(null);
    setMissingBlock(false);
    setQuoteStatus("none");
    setAnnotations([]);
    clearDom();
  }, [clearDom]);

  /**
   * Called by the panel when a validated review arrives. Builds passive
   * annotations for every anchored finding: exact quote ranges grouped
   * by status, plus gutter marker positions. blockId remains the sole
   * targeting authority — quotes are only searched inside their block.
   */
  const buildAnnotations = useCallback(
    (review: AiResumeReview) => {
      clearDom();
      setActive(null);
      setMissingBlock(false);
      setQuoteStatus("none");
      setAnnotations([]);

      const root = rootRef.current;
      if (!root || !quoteHighlightSupported()) return;

      const rootRect = root.getBoundingClientRect();
      const positive: Range[] = [];
      const improve: Range[] = [];
      const marks: Annotation[] = [];

      for (const [i, f] of review.findings.entries()) {
        const block = findBlock(root, f.blockId);
        if (!block) continue;
        const ranges = quoteRangesInBlock(block, f.quote);
        if (ranges.length === 0) continue;
        const improvement = f.status === "weak";
        (improvement ? improve : positive).push(...ranges);
        marks.push({
          key: `${f.blockId}:${i}`,
          blockId: f.blockId,
          quote: f.quote,
          label: `${improvement ? "Needs strengthening" : "Supporting"} finding: ${f.dimension.replaceAll("_", " ")}`,
          improvement,
          top: block.getBoundingClientRect().top - rootRect.top,
        });
      }

      // Registration order is paint order — passive groups first so the
      // active quote highlight (always re-registered on selection) wins.
      if (positive.length) {
        CSS.highlights.set(POSITIVE_HIGHLIGHT_NAME, new Highlight(...positive));
      }
      if (improve.length) {
        CSS.highlights.set(IMPROVE_HIGHLIGHT_NAME, new Highlight(...improve));
      }
      setAnnotations(marks);
    },
    [clearDom],
  );

  const locate = useCallback(
    (blockId: string, quote: string) => {
      setActive({ blockId, quote });
      clearActiveDom();

      const target = rootRef.current
        ? findBlock(rootRef.current, blockId)
        : undefined;

      if (!target) {
        setMissingBlock(true);
        setQuoteStatus("none");
        return;
      }
      setMissingBlock(false);
      target.classList.add("resume-block-active");

      if (quoteHighlightSupported()) {
        const ranges = quoteRangesInBlock(target, quote);
        if (ranges.length > 0) {
          CSS.highlights.set(QUOTE_HIGHLIGHT_NAME, new Highlight(...ranges));
          setQuoteStatus("ok");
        } else {
          setQuoteStatus("not-found");
        }
      } else {
        setQuoteStatus("unsupported");
      }

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    },
    [clearActiveDom],
  );

  // Recompute marker positions when the preview reflows.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || annotations.length === 0) return;
    const ro = new ResizeObserver(() => {
      const rootRect = root.getBoundingClientRect();
      setAnnotations((prev) =>
        prev.map((a) => {
          const block = findBlock(root, a.blockId);
          return block
            ? {
                ...a,
                top: block.getBoundingClientRect().top - rootRect.top,
              }
            : a;
        }),
      );
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [annotations.length]);

  useEffect(() => clearDom, [clearDom]);

  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      {/* ::highlight() is paint-only and not understood by the CSS
          bundler — kept as a runtime style tag scoped to this page. */}
      <style>{`
        ::highlight(rolerace-ai-quote) {
          background-color: var(--color-emerald-200, #a7f3d0);
          text-decoration: underline;
          text-decoration-color: var(--color-emerald-700, #047857);
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
        }
        ::highlight(rolerace-review-positive) {
          background-color: rgb(110 231 183 / 0.3);
          text-decoration: underline;
          text-decoration-color: rgb(110 231 183 / 0.55);
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        ::highlight(rolerace-review-improve) {
          background-color: rgb(253 230 138 / 0.4);
          text-decoration: underline;
          text-decoration-color: rgb(217 119 6 / 0.5);
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
      `}</style>
      <div className="order-2 xl:order-1">
        <section
          aria-label="Resume preview"
          className="rounded-2xl border border-stone-200 bg-stone-100/70 p-4 md:p-6"
        >
          <div
            ref={rootRef}
            className="relative mx-auto max-w-[720px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
          >
            {preview}
            {/* Decorative scan beam — derives purely from the pending
                review request; aria-hidden and never interactive. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                scanning ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`rr-scan-beam ${scanning ? "rr-scanning" : ""}`}
              />
            </div>
            {/* Passive review annotations — accessible markers anchored
                to each finding's canonical block, overlaid on the
                document edge without touching template DOM. */}
            {annotations.map((a) => (
              <button
                key={a.key}
                type="button"
                aria-label={a.label}
                onClick={() => locate(a.blockId, a.quote)}
                style={{ top: a.top }}
                className={`absolute left-1 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full border text-[11px] font-bold shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  a.improvement
                    ? "border-amber-500/50 bg-amber-100 text-amber-800"
                    : "border-emerald-500/50 bg-emerald-100 text-emerald-800"
                } ${active?.blockId === a.blockId ? "ring-2 ring-emerald-700" : ""}`}
              >
                {a.improvement ? "!" : "✓"}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section aria-label="AI review" className="order-1 xl:order-2">
        <CandidateAiReviewPanel
          variantId={variantId}
          targetRole={targetRole}
          targetCountry={targetCountry}
          activeBlockId={active?.blockId ?? null}
          missingBlock={missingBlock}
          quoteStatus={quoteStatus}
          onLocate={locate}
          onNewResult={reset}
          onReviewReady={buildAnnotations}
          onPendingChange={setScanning}
        />
      </section>
    </div>
  );
}
