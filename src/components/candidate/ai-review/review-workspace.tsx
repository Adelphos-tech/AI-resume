"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CandidateAiReviewPanel } from "@/components/candidate/ai-review/review-panel";

const QUOTE_HIGHLIGHT_NAME = "rolerace-ai-quote";

export type QuoteStatus = "none" | "unsupported" | "not-found" | "ok";

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

function clearQuoteHighlight() {
  if (quoteHighlightSupported()) {
    CSS.highlights.delete(QUOTE_HIGHLIGHT_NAME);
  }
}

/**
 * Client coordinator for the candidate AI Review workspace. Owns
 * activeFinding/activeBlockId state, applies the `resume-block-active`
 * whole-block treatment to the exact data-resume-block-id element, and
 * registers a CSS Custom Highlight for the finding's exact quote —
 * scoped to that block only. Browser state is never authoritative for
 * persisted resume data.
 */
export function ReviewWorkspace({
  variantId,
  preview,
}: {
  variantId: string;
  preview: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{
    blockId: string;
    quote: string;
  } | null>(null);
  const [missingBlock, setMissingBlock] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("none");

  const clearDom = useCallback(() => {
    rootRef.current
      ?.querySelectorAll("[data-resume-block-id]")
      .forEach((el) => el.classList.remove("resume-block-active"));
    clearQuoteHighlight();
  }, []);

  const locate = useCallback(
    (blockId: string, quote: string) => {
      setActive({ blockId, quote });
      clearDom();

      const target = rootRef.current
        ? Array.from(
            rootRef.current.querySelectorAll("[data-resume-block-id]"),
          ).find((el) => (el as HTMLElement).dataset.resumeBlockId === blockId)
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
    [clearDom],
  );

  const reset = useCallback(() => {
    setActive(null);
    setMissingBlock(false);
    setQuoteStatus("none");
    clearDom();
  }, [clearDom]);

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
      `}</style>
      <div className="order-2 xl:order-1">
        <section
          aria-label="Resume preview"
          className="rounded-2xl border border-stone-200 bg-stone-100/70 p-4 md:p-6"
        >
          <div
            ref={rootRef}
            className="mx-auto max-w-[720px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
          >
            {preview}
          </div>
        </section>
      </div>

      <section aria-label="AI review" className="order-1 xl:order-2">
        <CandidateAiReviewPanel
          variantId={variantId}
          activeBlockId={active?.blockId ?? null}
          missingBlock={missingBlock}
          quoteStatus={quoteStatus}
          onLocate={locate}
          onNewResult={reset}
        />
      </section>
    </div>
  );
}
