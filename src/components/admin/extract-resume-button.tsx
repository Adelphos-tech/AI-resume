"use client";

import { useState, useTransition } from "react";

import { extractResumeTextAction } from "@/app/admin/candidates/[id]/actions";
import { Button } from "@/components/ui/button";

export function ExtractResumeButton({
  candidateId,
  hasExtraction,
  failed,
}: {
  candidateId: string;
  hasExtraction: boolean;
  failed: boolean;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const label = failed
    ? "Retry extraction"
    : hasExtraction
      ? "Re-extract text"
      : "Extract resume text";

  function handleClick() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await extractResumeTextAction(candidateId);
        if (!result.success) {
          setFeedback(result.message);
        }
      } catch {
        setFeedback("Unable to extract text from this resume.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? "Extracting…" : label}
      </Button>
      {feedback && (
        <p role="alert" className="text-sm text-destructive">
          {feedback}
        </p>
      )}
    </div>
  );
}
