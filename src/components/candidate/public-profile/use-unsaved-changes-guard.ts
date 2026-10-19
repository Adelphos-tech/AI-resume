"use client";

import { useEffect } from "react";

/**
 * Warn before leaving the builder with unsaved changes.
 * Covers tab close / refresh (beforeunload) and in-app navigation via
 * anchor clicks — a confirm() cancels navigation when declined.
 * Same-page anchors, # links, and target=_blank links are ignored.
 */
export function useUnsavedChangesGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      const url = new URL(href, window.location.href);
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname
      )
        return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);
}
