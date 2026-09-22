"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const MAX_BYTES = 10 * 1024 * 1024;

export type ResumeMetadata = {
  originalFileName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string | Date;
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ResumeUpload({
  token,
  initial,
}: {
  token: string;
  initial: ResumeMetadata | null;
}) {
  const [resume, setResume] = useState<ResumeMetadata | null>(initial);
  const [selected, setSelected] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelected(file);
    setFeedback(null);
    if (file) {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
        setFeedback({
          kind: "error",
          message: "Upload a PDF or DOCX file.",
        });
      } else if (file.size > MAX_BYTES) {
        setFeedback({
          kind: "error",
          message: "Resume must be 10 MB or smaller.",
        });
      }
    }
  }

  async function handleUpload() {
    if (!selected || uploading) return;
    setUploading(true);
    setFeedback(null);
    try {
      const body = new FormData();
      body.append("resume", selected);
      const response = await fetch("/api/intake/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.success) {
        setResume(result.resume);
        setSelected(null);
        if (inputRef.current) inputRef.current.value = "";
        setFeedback({ kind: "success", message: "Resume uploaded." });
      } else {
        setFeedback({
          kind: "error",
          message:
            result?.message ?? "Unable to upload resume. Please try again.",
        });
      }
    } catch {
      setFeedback({
        kind: "error",
        message: "Unable to upload resume. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  const clientInvalid =
    feedback?.kind === "error" &&
    (feedback.message.includes("PDF or DOCX") ||
      feedback.message.includes("10 MB"));

  return (
    <div className="space-y-5">
      {resume ? (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium break-words">
            {resume.originalFileName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatSize(resume.sizeBytes)} · Uploaded{" "}
            {dateFormatter.format(new Date(resume.uploadedAt))}
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="resume-file">
          {resume ? "Replace resume" : "Upload resume"}
        </Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            ref={inputRef}
            id="resume-file"
            type="file"
            accept=".pdf,.docx"
            disabled={uploading}
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <Button
            type="button"
            disabled={!selected || uploading || clientInvalid}
            onClick={handleUpload}
            className="sm:shrink-0"
          >
            {uploading ? "Uploading…" : resume ? "Replace" : "Upload"}
          </Button>
        </div>
        {selected ? (
          <p className="text-sm text-muted-foreground">
            Selected: {selected.name} ({formatSize(selected.size)})
          </p>
        ) : null}
      </div>

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
