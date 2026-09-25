"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { candidateExtractResumeAction } from "@/app/candidate/(workspace)/profile/import/actions";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const MAX_BYTES = 10 * 1024 * 1024;

export type ImportedSource = {
  originalFileName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: Date;
  extraction: {
    status: "SUCCEEDED" | "NO_TEXT" | "FAILED";
    extractedText: string | null;
    pageCount: number | null;
    characterCount: number | null;
    parser: string | null;
    extractedAt: Date | null;
  } | null;
} | null;

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileTypeLabel(mimeType: string) {
  return mimeType === "application/pdf" ? "PDF" : "DOCX";
}

export function ResumeImport({
  source,
  hasProfile,
}: {
  source: ImportedSource;
  hasProfile: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startRefresh] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const extraction = source?.extraction ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelected(file);
    setError(null);
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setError("Upload a PDF or DOCX file.");
    } else if (file.size > MAX_BYTES) {
      setError("Resume must be 10 MB or smaller.");
    }
  }

  async function runExtraction() {
    setExtracting(true);
    setError(null);
    try {
      const result = await candidateExtractResumeAction();
      if (!result.success) {
        setError(result.message);
      }
      startRefresh(() => router.refresh());
    } catch {
      setError("Unable to extract this resume. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleUpload() {
    if (!selected || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("resume", selected);
      const response = await fetch("/api/candidate/resume", {
        method: "POST",
        body,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(
          result?.message ?? "Unable to upload resume. Please try again.",
        );
        return;
      }
      setSelected(null);
      if (inputRef.current) inputRef.current.value = "";
      await runExtraction();
    } catch {
      setError("Unable to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-900">
          {source ? "Your resume" : "Upload your resume"}
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          PDF or DOCX · up to 10 MB · extraction is deterministic and does not
          use AI.
        </p>

        {source && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-stone-50 px-4 py-3">
            <FileText
              className="mt-0.5 size-4 shrink-0 text-stone-500"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium break-words text-stone-900">
                {source.originalFileName}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                {fileTypeLabel(source.mimeType)} ·{" "}
                {formatSize(source.sizeBytes)} · Uploaded{" "}
                {dateFormatter.format(new Date(source.uploadedAt))}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          <Label htmlFor="resume-file">
            {source ? "Replace resume" : "Choose resume"}
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept=".pdf,.docx"
              disabled={uploading || extracting}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selected || uploading || extracting}
              className="gap-2 sm:shrink-0"
            >
              <Upload className="size-4" aria-hidden />
              {uploading
                ? "Uploading…"
                : extracting
                  ? "Extracting…"
                  : source
                    ? "Replace resume"
                    : "Upload resume"}
            </Button>
          </div>
          {selected && (
            <p className="text-xs text-stone-500">
              Selected: {selected.name} ({formatSize(selected.size)})
            </p>
          )}
        </div>

        {hasProfile && (
          <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Your Career Profile will not change until you explicitly import
            information from this resume.
          </p>
        )}
      </div>

      {extracting && (
        <p role="status" className="text-sm text-stone-600">
          Extracting resume text…
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!extracting && extraction?.status === "SUCCEEDED" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">
            Resume extracted
          </h2>
          <p className="text-xs text-stone-500">
            {source && fileTypeLabel(source.mimeType)}
            {extraction.pageCount
              ? ` · ${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"}`
              : ""}
            {extraction.characterCount
              ? ` · ${extraction.characterCount.toLocaleString()} characters`
              : ""}
            {
              " · This is the raw extracted text — nothing has been added to your Career Profile yet."
            }
          </p>
          <article
            aria-label="Extracted resume text"
            className="max-h-[32rem] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-relaxed whitespace-pre-wrap text-stone-800"
          >
            {extraction.extractedText}
          </article>
        </div>
      )}

      {!extracting && extraction?.status === "NO_TEXT" && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"
        >
          We couldn&apos;t find readable text in this resume. You can try
          another PDF or DOCX, or continue with your Career Profile manually.
        </div>
      )}

      {!extracting && extraction?.status === "FAILED" && (
        <div
          role="alert"
          className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700"
        >
          We couldn&apos;t extract text from this resume. You can try another
          PDF or DOCX, or continue with your Career Profile manually.
        </div>
      )}

      {!extracting && source && !extraction && (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Your resume is uploaded and ready to review.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runExtraction}
            disabled={extracting}
          >
            Extract resume text
          </Button>
        </div>
      )}
    </div>
  );
}
