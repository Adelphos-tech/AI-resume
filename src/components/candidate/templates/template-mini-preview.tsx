"use client";

import { useEffect, useRef, useState } from "react";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { TEMPLATE_DEMO_RESUME_DATA } from "@/lib/resume-template-demo";

/** Rendered resume width before scaling — matches template max-width. */
const BASE_WIDTH = 736;

/**
 * Scaled, decorative miniature of a real template render for the
 * Templates gallery. aria-hidden + inert: the preview is visual-only —
 * its headings/links must not pollute the accessibility tree or take
 * keyboard/pointer interaction.
 */
export function TemplateMiniPreview({ templateKey }: { templateKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / BASE_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none relative aspect-[210/297] overflow-hidden"
    >
      <div
        inert
        style={{
          width: BASE_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumeRenderer
          templateKey={templateKey}
          resumeData={TEMPLATE_DEMO_RESUME_DATA}
        />
      </div>
    </div>
  );
}
