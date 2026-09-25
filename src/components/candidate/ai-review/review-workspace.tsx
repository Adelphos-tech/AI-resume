"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CandidateAiReviewPanel } from "@/components/candidate/ai-review/review-panel";

/**
 * Client coordinator for the candidate AI Review workspace. Owns
 * activeFinding/activeBlockId state and applies/clears the
 * `resume-block-active` highlight on the exact element whose
 * data-resume-block-id matches the selected finding's blockId.
 * Browser state is never authoritative for persisted resume data.
 */
export function ReviewWorkspace({
  variantId,
  preview,
}: {
  variantId: string;
  preview: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [missingBlock, setMissingBlock] = useState(false);

  const locate = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
    setMissingBlock(false);
  }, []);

  const reset = useCallback(() => {
    setActiveBlockId(null);
    setMissingBlock(false);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const blocks = root.querySelectorAll("[data-resume-block-id]");
    blocks.forEach((el) => el.classList.remove("resume-block-active"));
    if (!activeBlockId) return;

    const target = Array.from(blocks).find(
      (el) => (el as HTMLElement).dataset.resumeBlockId === activeBlockId,
    );
    if (!target) {
      setMissingBlock(true);
      return;
    }

    target.classList.add("resume-block-active");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeBlockId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
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
          activeBlockId={activeBlockId}
          missingBlock={missingBlock}
          onLocate={locate}
          onNewResult={reset}
        />
      </section>
    </div>
  );
}
