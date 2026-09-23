import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeVariantCreateForm } from "@/components/admin/resume-variant-create-form";
import { Button } from "@/components/ui/button";
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
      intake: { select: { targetRoles: true } },
      careerProfile: { select: { candidateId: true } },
    },
  });

  if (!candidate) {
    notFound();
  }

  const variants = await listCandidateResumeVariants(candidate.id);
  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/candidates/${candidate.id}`}>
          <ArrowLeft />
          Back to candidate
        </Link>
      </Button>

      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Resume variants
        </h2>
        <p className="text-sm text-muted-foreground">{fullName}</p>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Existing resumes
        </h3>
        {variants.success && variants.variants.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {variants.variants.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/admin/candidates/${candidate.id}/resumes/${v.id}`}
                  className="block px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.targetRole} · {v.targetCountry} ·{" "}
                    {dateFormatter.format(v.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No resumes yet</p>
        )}
      </section>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Create resume
        </h3>
        {candidate.careerProfile ? (
          <ResumeVariantCreateForm
            candidateId={candidate.id}
            suggestedRoles={candidate.intake?.targetRoles ?? []}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Create the career profile before generating a resume.
          </p>
        )}
      </section>
    </div>
  );
}
