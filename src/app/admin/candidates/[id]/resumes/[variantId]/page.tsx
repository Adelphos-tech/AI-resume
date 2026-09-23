import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESUME_TEMPLATES, type ResumeTemplateKey } from "@/lib/resume-schema";
import { getResumeVariant } from "@/server/resume-variants/resume-variants";
import { requireInternalSession } from "@/server/session";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function ResumeVariantPage({
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

  const counts = [
    ["Experience entries", variant.resumeData.experience.length],
    ["Education entries", variant.resumeData.education.length],
    ["Skill groups", variant.resumeData.skills.length],
    ["Projects", variant.resumeData.projects.length],
    ["Certifications", variant.resumeData.certifications.length],
    ["Languages", variant.resumeData.languages.length],
  ] as const;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/candidates/${id}/resumes`}>
          <ArrowLeft />
          Back to resumes
        </Link>
      </Button>

      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{variant.name}</h2>
        <p className="text-sm text-muted-foreground">
          Created {dateFormatter.format(variant.createdAt)}
        </p>
      </header>

      <dl className="space-y-0">
        <div className="grid grid-cols-[9rem_1fr] items-baseline gap-4 py-2.5">
          <dt className="text-sm text-muted-foreground">Target role</dt>
          <dd className="text-sm">{variant.targetRole}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] items-baseline gap-4 py-2.5">
          <dt className="text-sm text-muted-foreground">Target country</dt>
          <dd className="text-sm">{variant.targetCountry}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] items-baseline gap-4 py-2.5">
          <dt className="text-sm text-muted-foreground">Template</dt>
          <dd className="text-sm">
            <Badge variant="secondary">
              {RESUME_TEMPLATES[variant.templateKey as ResumeTemplateKey]
                ?.name ?? variant.templateKey}
            </Badge>
          </dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] items-baseline gap-4 py-2.5">
          <dt className="text-sm text-muted-foreground">Profile version</dt>
          <dd className="text-sm">v{variant.profileSchemaVersion}</dd>
        </div>
      </dl>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Included content
        </h3>
        <dl className="space-y-0">
          {counts.map(([label, count]) => (
            <div
              key={label}
              className="grid grid-cols-[9rem_1fr] items-baseline gap-4 py-2.5"
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm">{count}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
