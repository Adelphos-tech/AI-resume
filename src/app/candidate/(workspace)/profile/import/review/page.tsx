import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ImportReview } from "@/components/candidate/profile/import-review";
import { prisma } from "@/server/db";
import { parseResumeText } from "@/server/resume-import/parse-resume";
import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "Review import — RoleRace" };

export default async function CandidateResumeImportReviewPage() {
  const { candidate } = await requireCandidateSession();

  const source = await prisma.candidateResumeSource.findUnique({
    where: { candidateId: candidate.id },
    select: {
      originalFileName: true,
      mimeType: true,
      extraction: {
        select: { status: true, extractedText: true },
      },
    },
  });

  if (
    !source?.extraction ||
    source.extraction.status !== "SUCCEEDED" ||
    !source.extraction.extractedText
  ) {
    redirect("/candidate/profile/import");
  }

  const draft = parseResumeText(source.extraction.extractedText);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/candidate/profile/import"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to Import
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
          Review information from your resume
        </h1>
        <p className="mt-1.5 text-sm text-stone-600">
          Check what RoleRace found before adding anything to your Career
          Profile.
        </p>
      </div>

      <ImportReview
        draft={draft}
        rawText={source.extraction.extractedText}
        fileName={source.originalFileName}
        fileType={source.mimeType === "application/pdf" ? "PDF" : "DOCX"}
      />
    </div>
  );
}
