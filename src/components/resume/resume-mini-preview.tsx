"use client";

import { useEffect, useRef, useState } from "react";

import { ResumeRenderer } from "@/components/resume/resume-renderer";
import type { ResumeData } from "@/lib/resume-schema";

/** Rendered resume width before scaling — matches template max-width. */
const BASE_WIDTH = 736;

/**
 * Scaled, decorative miniature of a real ResumeRenderer output. The
 * parent controls the viewport size/clipping; this component measures
 * its width and scales the document to fit. aria-hidden + inert +
 * pointer-events-none: visual-only — internal headings/links must not
 * enter the accessibility tree or take keyboard/pointer interaction.
 */
export function ResumeMiniPreview({
  templateKey,
  resumeData,
}: {
  templateKey: string;
  resumeData: ResumeData;
}) {
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
      className="pointer-events-none relative h-full w-full overflow-hidden"
    >
      <div
        inert
        className="absolute top-0 left-0"
        style={{
          width: BASE_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumeRenderer templateKey={templateKey} resumeData={resumeData} />
      </div>
    </div>
  );
}
