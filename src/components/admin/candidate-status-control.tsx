"use client";

import { useState, useTransition } from "react";

import { updateCandidateStatusAction } from "@/app/admin/candidates/[id]/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANDIDATE_STATUS_LABELS } from "@/lib/candidate-labels";
import type { CandidateStatus } from "@/generated/prisma/enums";

export function CandidateStatusControl({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: CandidateStatus;
}) {
  const [selected, setSelected] = useState<CandidateStatus>(currentStatus);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const unchanged = selected === currentStatus;

  function handleUpdate() {
    if (unchanged || isPending) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await updateCandidateStatusAction(candidateId, {
          status: selected,
        });
        if (result.success) {
          setFeedback({ kind: "success", message: "Status updated." });
        } else {
          setFeedback({
            kind: "error",
            message: "Unable to update status. Please try again.",
          });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to update status. Please try again.",
        });
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="candidate-status-select">Change status</Label>
        <Select
          value={selected}
          onValueChange={(value) => setSelected(value as CandidateStatus)}
          disabled={isPending}
        >
          <SelectTrigger id="candidate-status-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={unchanged || isPending}
        onClick={handleUpdate}
      >
        {isPending ? "Updating…" : "Update status"}
      </Button>

      {feedback ? (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={
            feedback.kind === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
