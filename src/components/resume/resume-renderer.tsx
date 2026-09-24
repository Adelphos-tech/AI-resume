import {
  RESUME_TEMPLATES,
  type ResumeData,
  type ResumeTemplateKey,
} from "@/lib/resume-schema";

import { AtsClassicTemplate } from "./templates/ats-classic";
import { CompactProfessionalTemplate } from "./templates/compact-professional";
import { CorporateProfessionalTemplate } from "./templates/corporate-professional";
import { ElegantSerifTemplate } from "./templates/elegant-serif";
import { EmeraldBannerTemplate } from "./templates/emerald-banner";
import { ExecutiveTemplate } from "./templates/executive";
import { ModernMinimalTemplate } from "./templates/modern-minimal";
import { TechnicalTemplate } from "./templates/technical";

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
    case "technical":
      return <TechnicalTemplate data={resumeData} />;
    case "modern-minimal":
      return <ModernMinimalTemplate data={resumeData} />;
    case "compact-professional":
      return <CompactProfessionalTemplate data={resumeData} />;
    case "executive":
      return <ExecutiveTemplate data={resumeData} />;
    case "elegant-serif":
      return <ElegantSerifTemplate data={resumeData} />;
    case "emerald-banner":
      return <EmeraldBannerTemplate data={resumeData} />;
  }
}
