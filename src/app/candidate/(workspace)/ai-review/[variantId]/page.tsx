import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewWorkspace } from "@/components/candidate/ai-review/review-workspace";
import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { RESUME_TEMPLATES, type ResumeTemplateKey } from "@/lib/resume-schema";
import { getResumeVariantCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "AI Review — RoleRace" };

export default async function CandidateAiReviewWorkspacePage({
  params,
}: {
  params: Promise<{ variantId: string }>;
}) {
  const { candidate } = await requireCandidateSession();
  const { variantId } = await params;

  const result = await getResumeVariantCore(variantId);
  if (!result.success || result.variant.candidateId !== candidate.id) {
    notFound();
  }
  const variant = result.variant;
  const templateName =
    RESUME_TEMPLATES[variant.templateKey as ResumeTemplateKey]?.name ??
    variant.templateKey;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/candidate/ai-review"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to AI Review
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            AI Review
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            {variant.targetRole} · {variant.targetCountry}
            <span className="text-stone-400">
              {" "}
              · {variant.name} · {templateName}
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            Review strengths, improvement areas, and missing evidence directly
            against this saved resume.
          </p>
        </div>
        <Link
          href={`/candidate/resumes/${variant.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <FileText className="size-4" aria-hidden />
          View resume
        </Link>
      </div>

      <ReviewWorkspace
        variantId={variant.id}
        targetRole={variant.targetRole}
        targetCountry={variant.targetCountry}
        preview={
          <ResumeRenderer
            templateKey={variant.templateKey}
            resumeData={variant.resumeData}
          />
        }
      />
    </div>
  );
}
