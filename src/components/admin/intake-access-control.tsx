"use client";

import { useState, useTransition } from "react";

import {
  generateIntakeLinkAction,
  revokeIntakeLinkAction,
} from "@/app/admin/candidates/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function IntakeAccessControl({
  candidateId,
  access,
}: {
  candidateId: string;
  access: { expiresAt: Date; revokedAt: Date | null } | null;
}) {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const active =
    access !== null && access.revokedAt === null && access.expiresAt > now;
  const revoked = access !== null && access.revokedAt !== null;
  const expired =
    access !== null && access.revokedAt === null && access.expiresAt <= now;

  function handleGenerate() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await generateIntakeLinkAction(candidateId);
        if (result.success) {
          setGeneratedUrl(`${window.location.origin}/intake/${result.token}`);
        } else {
          setFeedback({
            kind: "error",
            message: "Unable to generate intake link. Please try again.",
          });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to generate intake link. Please try again.",
        });
      }
    });
  }

  function handleRevoke() {
    setFeedback(null);
    setGeneratedUrl(null);
    startTransition(async () => {
      try {
        const result = await revokeIntakeLinkAction(candidateId);
        setFeedback(
          result.success
            ? { kind: "success", message: "Intake link revoked." }
            : {
                kind: "error",
                message: "Unable to revoke intake link. Please try again.",
              },
        );
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to revoke intake link. Please try again.",
        });
      }
    });
  }

  async function handleCopy() {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setFeedback({ kind: "success", message: "Link copied." });
    } catch {
      setFeedback({
        kind: "error",
        message: "Unable to copy link. Copy it manually.",
      });
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {access === null && "No active intake link"}
        {active &&
          `Intake link active · Expires ${dateFormatter.format(access!.expiresAt)}`}
        {revoked && "Intake link revoked"}
        {expired && "Intake link expired"}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={handleGenerate}
        >
          {pending && !generatedUrl
            ? "Generating…"
            : active
              ? "Generate new link"
              : "Generate intake link"}
        </Button>
        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={handleRevoke}
          >
            Revoke link
          </Button>
        )}
      </div>

      {generatedUrl ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
          <Label htmlFor="generated-intake-link">Candidate intake link</Label>
          <div className="flex gap-2">
            <Input
              id="generated-intake-link"
              readOnly
              value={generatedUrl}
              className="text-xs"
              onFocus={(e) => e.target.select()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              Copy link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Copy this link now. For security, it won&apos;t be shown again after
            you leave or refresh this page.
          </p>
        </div>
      ) : null}

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
