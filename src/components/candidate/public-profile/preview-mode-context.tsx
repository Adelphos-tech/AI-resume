"use client";

import { createContext, useContext } from "react";

export type PreviewMode = "desktop" | "mobile";

const PreviewModeContext = createContext<PreviewMode | null>(null);

export function PreviewModeProvider({
  mode,
  children,
}: {
  mode: PreviewMode;
  children?: React.ReactNode;
}) {
  return (
    <PreviewModeContext.Provider value={mode}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode(): PreviewMode | null {
  return useContext(PreviewModeContext);
}

/** Return mobile/desktop classes when inside a preview, or the public
 *  viewport-based fallback when rendered on the real public page. */
export function useResponsiveClasses(
  mobile: string,
  desktop: string,
  publicFallback: string,
): string {
  const mode = usePreviewMode();
  if (!mode) return publicFallback;
  return mode === "mobile" ? mobile : desktop;
}
