import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { getResumeVariant } from "@/server/resume-variants/resume-variants";
import { requireInternalSession } from "@/server/session";

/**
 * Internal print surface — renders ONLY the resume document for
 * Chromium PDF generation. Requires an internal session; not linked
 * in the UI and lives outside the admin shell so no chrome renders.
 */
export default async function ResumePrintPage({
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
    <div className="bg-white">
      <ResumeRenderer
        templateKey={variant.templateKey}
        resumeData={variant.resumeData}
      />
    </div>
  );
}
