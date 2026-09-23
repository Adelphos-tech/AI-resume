import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RESUME_TEMPLATES } from "@/lib/resume-schema";
import { prisma } from "@/server/db";
import { listCandidateResumeVariants } from "@/server/resume-variants/resume-variants";
import { requireInternalSession } from "@/server/session";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function CandidateResumesPage({
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
      careerProfile: { select: { candidateId: true } },
    },
  });

  if (!candidate) {
    notFound();
  }

  const variants = await listCandidateResumeVariants(candidate.id);
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const canCreate = !!candidate.careerProfile;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/candidates/${candidate.id}`}>
          <ArrowLeft />
          Back to candidate
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Resume variants
          </h1>
          <p className="text-sm text-muted-foreground">{fullName}</p>
        </header>
        {canCreate && (
          <Button asChild>
            <Link href={`/admin/candidates/${candidate.id}/resumes/new`}>
              <Plus />
              Create resume
            </Link>
          </Button>
        )}
      </div>

      {variants.success && variants.variants.length > 0 ? (
        <ul className="divide-y rounded-xl border bg-white">
          {variants.variants.map((v) => (
            <li key={v.id}>
              <Link
                href={`/admin/candidates/${candidate.id}/resumes/${v.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{v.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {v.targetRole} · {v.targetCountry}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground">
                    {RESUME_TEMPLATES[
                      v.templateKey as keyof typeof RESUME_TEMPLATES
                    ]?.name ?? v.templateKey}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {dateFormatter.format(v.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed bg-white p-10 text-center">
          <FileText className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No resumes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a resume from the candidate&rsquo;s reviewed career profile.
          </p>
          {canCreate && (
            <Button asChild className="mt-5">
              <Link href={`/admin/candidates/${candidate.id}/resumes/new`}>
                <Plus />
                Create resume
              </Link>
            </Button>
          )}
          {!canCreate && (
            <p className="mt-4 text-xs text-muted-foreground">
              Create the career profile before generating a resume.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
