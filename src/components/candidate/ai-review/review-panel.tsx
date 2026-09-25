"use client";

import { Crosshair, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { candidateReviewResumeAction } from "@/app/candidate/(workspace)/ai-review/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiResumeReview } from "@/server/ai/resume-review-schema";

const OVERALL_LABELS: Record<AiResumeReview["overall"]["status"], string> = {
  strong_fit: "Strong fit",
  good_foundation: "Good foundation",
  needs_strengthening: "Needs strengthening",
};

const FINDING_LABELS: Record<
  AiResumeReview["findings"][number]["status"],
  string
> = {
  strong: "Strong",
  supporting: "Supporting",
  weak: "Weak",
};

export function CandidateAiReviewPanel({
  variantId,
  activeBlockId,
  missingBlock,
  onLocate,
  onNewResult,
}: {
  variantId: string;
  activeBlockId: string | null;
  missingBlock: boolean;
  onLocate: (blockId: string) => void;
  onNewResult: () => void;
}) {
  const [review, setReview] = useState<AiResumeReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onReview() {
    if (isPending) return;
    setError(null);
    onNewResult();
    startTransition(async () => {
      try {
        const result = await candidateReviewResumeAction({ variantId });
        if (result.success) {
          setReview(result.review);
        } else {
          setError(result.message);
        }
      } catch {
        setError("We couldn't complete this review. Please try again.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
      <h2 className="text-sm font-semibold tracking-wide text-stone-900">
        AI Resume Review
      </h2>

      {!review && (
        <div className="mt-3 space-y-4">
          <p className="text-sm leading-relaxed text-stone-600">
            Review this saved resume against its target role and country.
            Feedback considers role alignment, evidence strength, skills
            relevance, clarity and specificity, achievement evidence, country
            presentation, and ATS readability.
          </p>
          <p className="text-xs text-stone-500">
            Reviews run only when you request them. Review results are temporary
            and are not saved yet.
          </p>
          <Button
            type="button"
            onClick={onReview}
            disabled={isPending}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Sparkles className="size-4" aria-hidden />
            {isPending ? "Reviewing…" : "Review with AI"}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 space-y-3">
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
          {!review && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReview}
              disabled={isPending}
            >
              {isPending ? "Reviewing…" : "Try again"}
            </Button>
          )}
        </div>
      )}

      {review && (
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">
              {OVERALL_LABELS[review.overall.status]}
            </Badge>
            <p className="text-sm leading-relaxed text-stone-700">
              {review.overall.summary}
            </p>
          </div>

          {review.findings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-900">Findings</h3>
              <ul className="space-y-3">
                {review.findings.map((f, i) => (
                  <li
                    key={`${f.blockId}:${i}`}
                    className={`space-y-2 rounded-xl border p-4 ${
                      activeBlockId === f.blockId
                        ? "border-emerald-600/50 bg-emerald-50/40"
                        : "border-stone-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          f.status === "weak" ? "destructive" : "secondary"
                        }
                      >
                        {FINDING_LABELS[f.status]}
                      </Badge>
                      <span className="text-xs text-stone-500 capitalize">
                        {f.dimension.replaceAll("_", " ")}
                      </span>
                      <button
                        type="button"
                        aria-pressed={activeBlockId === f.blockId}
                        aria-label={`View finding in resume: ${f.dimension.replaceAll("_", " ")}`}
                        onClick={() => onLocate(f.blockId)}
                        className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
                      >
                        <Crosshair className="size-3.5" aria-hidden />
                        {activeBlockId === f.blockId
                          ? "Viewing in resume"
                          : "View in resume"}
                      </button>
                    </div>
                    {missingBlock && activeBlockId === f.blockId && (
                      <p role="alert" className="text-xs text-red-600">
                        We couldn&apos;t locate this section in the preview.
                      </p>
                    )}
                    <blockquote className="rounded-md border-l-2 border-emerald-600/40 bg-stone-50 py-1.5 pl-3 text-sm text-stone-600 italic">
                      {f.quote}
                    </blockquote>
                    <p className="text-sm text-stone-800">{f.reason}</p>
                    {f.guidance && (
                      <p className="text-sm text-stone-500">{f.guidance}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.gaps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-900">
                Missing evidence
              </h3>
              <ul className="space-y-3">
                {review.gaps.map((g, i) => (
                  <li
                    key={i}
                    className="space-y-1.5 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-4"
                  >
                    <p className="text-xs font-semibold tracking-wide text-stone-600 uppercase">
                      {g.category.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm text-stone-800">{g.reason}</p>
                    {g.guidance && (
                      <p className="text-sm text-stone-500">{g.guidance}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
