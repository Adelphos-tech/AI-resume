import { ArrowLeft, FileDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { RESUME_TEMPLATES, type ResumeTemplateKey } from "@/lib/resume-schema";
import { getResumeVariantCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "Resume — LinkMeU" };

export default async function CandidateResumeDetailPage({
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
          href="/candidate/resumes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to resumes
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            {variant.name}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            {variant.targetRole} · {variant.targetCountry} · {templateName}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/candidate/ai-review/${variantId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/50 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
          >
            <Sparkles className="size-4" aria-hidden />
            Review with AI
          </Link>
          <a
            href={`/candidate/resumes/${variantId}/pdf`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            <FileDown className="size-4" aria-hidden />
            Download PDF
          </a>
          <a
            href={`/candidate/resumes/${variantId}/docx`}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:bg-emerald-50/50"
          >
            <FileDown className="size-4" aria-hidden />
            Download DOCX
          </a>
        </div>
      </div>

      <section
        aria-label="Resume preview"
        className="rounded-2xl border border-stone-200 bg-stone-100/70 p-4 md:p-8"
      >
        <div className="mx-auto max-w-[820px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <ResumeRenderer
            templateKey={variant.templateKey}
            resumeData={variant.resumeData}
          />
        </div>
      </section>
    </div>
  );
}
