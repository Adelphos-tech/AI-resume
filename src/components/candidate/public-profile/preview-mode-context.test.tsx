import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PreviewModeProvider,
  usePreviewMode,
  useResponsiveClasses,
} from "./preview-mode-context";

function ModeConsumer() {
  const mode = usePreviewMode();
  return <span data-mode={mode ?? "null"}>mode</span>;
}

function ClassesConsumer({
  mobile,
  desktop,
  fallback,
}: {
  mobile: string;
  desktop: string;
  fallback: string;
}) {
  const cls = useResponsiveClasses(mobile, desktop, fallback);
  return <span className={cls}>classes</span>;
}

describe("PreviewModeContext", () => {
  it("usePreviewMode returns null outside provider", () => {
    const html = renderToStaticMarkup(createElement(ModeConsumer));
    expect(html).toContain('data-mode="null"');
  });

  it("usePreviewMode returns mobile when inside provider", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(ModeConsumer),
      ),
    );
    expect(html).toContain('data-mode="mobile"');
  });

  it("usePreviewMode returns desktop when inside provider", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(ModeConsumer),
      ),
    );
    expect(html).toContain('data-mode="desktop"');
  });

  it("useResponsiveClasses returns publicFallback outside provider", () => {
    const html = renderToStaticMarkup(
      createElement(ClassesConsumer, {
        mobile: "mobile-class",
        desktop: "desktop-class",
        fallback: "fallback-class",
      }),
    );
    expect(html).toContain('class="fallback-class"');
  });

  it("useResponsiveClasses returns mobile class inside provider", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(ClassesConsumer, {
          mobile: "mobile-class",
          desktop: "desktop-class",
          fallback: "fallback-class",
        }),
      ),
    );
    expect(html).toContain('class="mobile-class"');
  });

  it("useResponsiveClasses returns desktop class inside provider", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(ClassesConsumer, {
          mobile: "mobile-class",
          desktop: "desktop-class",
          fallback: "fallback-class",
        }),
      ),
    );
    expect(html).toContain('class="desktop-class"');
  });
});
