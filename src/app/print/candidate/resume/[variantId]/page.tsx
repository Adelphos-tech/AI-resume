import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { getResumeVariantCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

/**
 * Candidate print surface — same internal-only document render as the
 * admin print page, guarded by the candidate session and ownership.
 * Never reachable without an authenticated owned session.
 */
export default async function CandidateResumePrintPage({
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

  return (
    <div className="bg-white">
      <ResumeRenderer
        templateKey={variant.templateKey}
        resumeData={variant.resumeData}
      />
    </div>
  );
}
