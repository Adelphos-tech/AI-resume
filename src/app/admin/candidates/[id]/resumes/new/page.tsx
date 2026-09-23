import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeVariantCreateForm } from "@/components/admin/resume-variant-create-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

export default async function NewResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInternalSession();
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      intake: { select: { targetRoles: true } },
      careerProfile: { select: { candidateId: true } },
    },
  });

  if (!candidate) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/candidates/${candidate.id}/resumes`}>
          <ArrowLeft />
          Back to resumes
        </Link>
      </Button>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create resume</h1>
        <p className="text-sm text-muted-foreground">
          Create a role-specific resume from the candidate&rsquo;s reviewed
          career profile.
        </p>
      </header>

      {candidate.careerProfile ? (
        <ResumeVariantCreateForm
          candidateId={candidate.id}
          suggestedRoles={candidate.intake?.targetRoles ?? []}
        />
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Create the career profile before generating a resume.
        </p>
      )}
    </div>
  );
}
