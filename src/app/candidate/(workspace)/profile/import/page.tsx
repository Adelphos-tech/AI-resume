import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ResumeImport } from "@/components/candidate/profile/resume-import";
import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "Import resume — RoleRace" };

export default async function CandidateResumeImportPage() {
  const { candidate } = await requireCandidateSession();

  const source = await prisma.candidateResumeSource.findUnique({
    where: { candidateId: candidate.id },
    select: {
      originalFileName: true,
      sizeBytes: true,
      mimeType: true,
      uploadedAt: true,
      extraction: {
        select: {
          status: true,
          extractedText: true,
          pageCount: true,
          characterCount: true,
          parser: true,
          extractedAt: true,
        },
      },
    },
  });

  const hasProfile = await prisma.masterCareerProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/candidate/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to Career Profile
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Import existing resume
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Upload your current resume and review the extracted text before adding
          anything to your Career Profile.
        </p>
      </div>

      <ResumeImport source={source} hasProfile={hasProfile !== null} />
    </div>
  );
}
