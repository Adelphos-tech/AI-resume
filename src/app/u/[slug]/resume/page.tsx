import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import type { ResumeData } from "@/lib/resume-schema";
import { prisma } from "@/server/db";
import { getCandidateSession } from "@/server/session";

export const metadata = { title: "Resume — RoleRace" };

export const dynamic = "force-dynamic";

/**
 * Public read-only view of the featured resume. Renders the persisted
 * immutable variant snapshot — never regenerated from the live MCP and
 * never exposes export/editing surfaces.
 */
export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    include: {
      featuredResumeVariant: {
        select: {
          candidateId: true,
          name: true,
          templateKey: true,
          resumeData: true,
        },
      },
    },
  });

  const variant = profile?.featuredResumeVariant;
  // Owner preview: the owning candidate may view their featured resume while
  // the profile is unpublished; everyone else gets a 404.
  const isOwner =
    profile != null &&
    !profile.isPublished &&
    (await getCandidateSession())?.candidate.id === profile.candidateId;
  // Fail closed: unpublished (non-owner), no featured resume, or ownership
  // drift.
  if (
    (!profile?.isPublished && !isOwner) ||
    !profile ||
    !variant ||
    variant.candidateId !== profile.candidateId
  ) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/u/${slug}`}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-600 hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to profile
        </Link>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
          <ResumeRenderer
            resumeData={variant.resumeData as ResumeData}
            templateKey={variant.templateKey}
          />
        </div>
        <p className="mt-6 text-center text-xs font-semibold tracking-widest text-stone-400 uppercase">
          RoleRace
        </p>
      </div>
    </main>
  );
}
