import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeUpload } from "@/components/intake/resume-upload";
import { resolveCandidateIntakeToken } from "@/server/candidates/intake-access";
import { getCandidateResumeSource } from "@/server/candidates/resume-source";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume | RoleRace",
  robots: { index: false, follow: false },
};

export default async function IntakeResumePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolved = await resolveCandidateIntakeToken(token);

  if (!resolved) {
    notFound();
  }

  const resume = await getCandidateResumeSource(resolved.candidateId);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <header className="space-y-4">
        <p className="text-sm font-semibold tracking-wide text-primary">
          RoleRace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
        <p className="text-muted-foreground">
          Hi {resolved.firstName}, upload your current resume.
        </p>
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF or DOCX. Maximum file size: 10 MB.
        </p>
      </header>

      <div className="mt-10">
        <ResumeUpload token={token} initial={resume} />
      </div>

      <div className="mt-10 border-t pt-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/intake/${token}`}>
            <ArrowLeft />
            Back to career intake
          </Link>
        </Button>
      </div>
    </main>
  );
}
