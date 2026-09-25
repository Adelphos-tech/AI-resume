import { ResumeMiniPreview } from "@/components/resume/resume-mini-preview";
import { TEMPLATE_DEMO_RESUME_DATA } from "@/lib/resume-template-demo";

/**
 * Gallery card preview: the fixed fictional demo resume rendered by the
 * real template at A4 proportions, clipped by the parent viewport.
 */
export function TemplateMiniPreview({ templateKey }: { templateKey: string }) {
  return (
    <div className="aspect-[210/297]">
      <ResumeMiniPreview
        templateKey={templateKey}
        resumeData={TEMPLATE_DEMO_RESUME_DATA}
      />
    </div>
  );
}
