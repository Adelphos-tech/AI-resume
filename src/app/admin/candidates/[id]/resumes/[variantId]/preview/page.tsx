import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { Button } from "@/components/ui/button";
import { getResumeVariant } from "@/server/resume-variants/resume-variants";
import { requireInternalSession } from "@/server/session";

export default async function ResumePreviewPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  await requireInternalSession();
  const { id, variantId } = await params;

  const result = await getResumeVariant(variantId);
  if (!result.success || result.variant.candidateId !== id) {
    notFound();
  }
  const variant = result.variant;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/admin/candidates/${id}/resumes/${variantId}`}>
            <ArrowLeft />
            Back to resume
          </Link>
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">{variant.name}</h2>
        <p className="text-sm text-muted-foreground">
          {variant.targetRole} · {variant.targetCountry}
        </p>
      </div>

      {/* Neutral preview canvas — chrome stays outside the document. */}
      <div className="rounded-lg bg-neutral-100 py-6 shadow-inner sm:py-10">
        <div className="mx-auto max-w-[50rem] px-3 sm:px-6">
          <div className="overflow-hidden rounded-sm shadow-lg">
            <ResumeRenderer
              templateKey={variant.templateKey}
              resumeData={variant.resumeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
