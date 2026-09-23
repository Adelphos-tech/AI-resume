import {
  RESUME_TEMPLATES,
  type ResumeData,
  type ResumeTemplateKey,
} from "@/lib/resume-schema";

import { AtsClassicTemplate } from "./templates/ats-classic";
import { CorporateProfessionalTemplate } from "./templates/corporate-professional";

/**
 * Resume document dispatcher. `templateKey` comes from a persisted
 * ResumeVariant but is only ever resolved against the static registry —
 * no dynamic component execution from database values.
 */
export function ResumeRenderer({
  templateKey,
  resumeData,
}: {
  templateKey: string;
  resumeData: ResumeData;
}) {
  if (!Object.hasOwn(RESUME_TEMPLATES, templateKey)) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        This resume uses an unsupported template.
      </div>
    );
  }

  switch (templateKey as ResumeTemplateKey) {
    case "ats-classic":
      return <AtsClassicTemplate data={resumeData} />;
    case "corporate-professional":
      return <CorporateProfessionalTemplate data={resumeData} />;
  }
}
