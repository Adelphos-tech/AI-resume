"use client";

import { Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { reviewResumeAction } from "@/app/admin/candidates/[id]/resumes/[variantId]/actions";
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

export function AiReviewPanel({
  candidateId,
  variantId,
}: {
  candidateId: string;
  variantId: string;
}) {
  const [review, setReview] = useState<AiResumeReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onReview() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await reviewResumeAction(candidateId, variantId);
        if (result.success) {
          setReview(result.review);
        } else {
          setError(result.message);
        }
      } catch {
        setError("Unable to complete AI review. Please try again.");
      }
    });
  }

  return (
    <section className="space-y-4 border-t pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          AI review
        </h3>
        {!review && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReview}
            disabled={isPending}
          >
            <Sparkles />
            {isPending ? "Reviewing…" : "Review with AI"}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {review && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Badge variant="secondary">
              {OVERALL_LABELS[review.overall.status]}
            </Badge>
            <p className="max-w-prose text-sm leading-relaxed">
              {review.overall.summary}
            </p>
          </div>

          {review.findings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Findings</h4>
              <ul className="space-y-3">
                {review.findings.map((f, i) => (
                  <li
                    key={`${f.blockId}:${i}`}
                    className="space-y-1.5 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          f.status === "weak" ? "destructive" : "secondary"
                        }
                      >
                        {FINDING_LABELS[f.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {f.dimension.replace("_", " ")}
                      </span>
                    </div>
                    <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground italic">
                      {f.quote}
                    </blockquote>
                    <p className="text-sm">{f.reason}</p>
                    {f.guidance && (
                      <p className="text-sm text-muted-foreground">
                        {f.guidance}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.gaps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Gaps</h4>
              <ul className="space-y-3">
                {review.gaps.map((g, i) => (
                  <li key={i} className="space-y-1 rounded-lg border p-4">
                    <p className="text-sm font-medium capitalize">
                      {g.category}
                    </p>
                    <p className="text-sm">{g.reason}</p>
                    {g.guidance && (
                      <p className="text-sm text-muted-foreground">
                        {g.guidance}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
