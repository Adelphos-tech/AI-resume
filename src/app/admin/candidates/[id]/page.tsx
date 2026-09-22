import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidateStatusControl } from "@/components/admin/candidate-status-control";
import { ExtractResumeButton } from "@/components/admin/extract-resume-button";
import { IntakeAccessControl } from "@/components/admin/intake-access-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CANDIDATE_PACKAGE_LABELS,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/candidate-labels";
import { getCandidate } from "@/server/candidates/get-candidate";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-4 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

function Missing() {
  return <span className="text-muted-foreground">Not provided</span>;
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidate(id);

  if (!candidate) {
    notFound();
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/candidates">
          <ArrowLeft />
          Back to candidates
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{fullName}</h2>
          <a
            href={`mailto:${candidate.email}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {candidate.email}
          </a>
        </div>
        <Badge variant="secondary">
          {CANDIDATE_STATUS_LABELS[candidate.status]}
        </Badge>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Contact
          </h3>
          <dl className="divide-y divide-border border-y">
            <Field label="Email">
              <a
                href={`mailto:${candidate.email}`}
                className="underline-offset-4 hover:underline"
              >
                {candidate.email}
              </a>
            </Field>
            <Field label="Phone">{candidate.phone ?? <Missing />}</Field>
            <Field label="Location">{candidate.location ?? <Missing />}</Field>
            <Field label="LinkedIn">
              {candidate.linkedinUrl ? (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                >
                  View profile
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : (
                <Missing />
              )}
            </Field>
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Engagement
          </h3>
          <dl className="divide-y divide-border border-y">
            <Field label="Package">
              <Badge variant="outline">
                {CANDIDATE_PACKAGE_LABELS[candidate.package]}
              </Badge>
            </Field>
            <Field label="Status">
              <Badge variant="secondary">
                {CANDIDATE_STATUS_LABELS[candidate.status]}
              </Badge>
            </Field>
            <Field label="Created">
              {dateFormatter.format(candidate.createdAt)}
            </Field>
            <Field label="Last updated">
              {dateFormatter.format(candidate.updatedAt)}
            </Field>
          </dl>
          <CandidateStatusControl
            candidateId={candidate.id}
            currentStatus={candidate.status}
          />
        </section>
      </div>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Intake access
        </h3>
        <p className="text-sm text-muted-foreground">
          Intake:{" "}
          {candidate.intake === null
            ? "Not started"
            : candidate.intake.submittedAt
              ? `Submitted · ${dateFormatter.format(candidate.intake.submittedAt)}`
              : `Draft saved · Updated ${dateFormatter.format(candidate.intake.updatedAt)}`}
        </p>
        <IntakeAccessControl
          candidateId={candidate.id}
          access={candidate.intakeAccess}
        />
      </section>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Resume
        </h3>
        {candidate.resumeSource ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="font-medium break-words">
                {candidate.resumeSource.originalFileName}
              </p>
              <p className="mt-1 text-muted-foreground">
                {formatBytes(candidate.resumeSource.sizeBytes)} · Uploaded{" "}
                {dateFormatter.format(candidate.resumeSource.uploadedAt)}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Text extraction</p>
              <ExtractionSummary
                extraction={candidate.resumeSource.extraction}
              />
              <ExtractResumeButton
                candidateId={candidate.id}
                hasExtraction={candidate.resumeSource.extraction !== null}
                failed={candidate.resumeSource.extraction?.status === "FAILED"}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not uploaded</p>
        )}
      </section>
    </div>
  );
}

function ExtractionSummary({
  extraction,
}: {
  extraction: {
    status: "SUCCEEDED" | "NO_TEXT" | "FAILED";
    pageCount: number | null;
    characterCount: number | null;
  } | null;
}) {
  if (!extraction) {
    return <p className="text-muted-foreground">Not processed</p>;
  }
  if (extraction.status === "NO_TEXT") {
    return (
      <p className="text-muted-foreground">No machine-readable text found.</p>
    );
  }
  if (extraction.status === "FAILED") {
    return (
      <p className="text-muted-foreground">
        Unable to extract text from this resume.
      </p>
    );
  }
  const chars = (extraction.characterCount ?? 0).toLocaleString("en-GB");
  return (
    <p className="text-muted-foreground">
      Extracted ·{" "}
      {extraction.pageCount !== null
        ? `${extraction.pageCount} ${extraction.pageCount === 1 ? "page" : "pages"} · `
        : ""}
      {chars} characters
    </p>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
