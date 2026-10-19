"use client";

import { Check, Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type SaveBarStatus = "clean" | "dirty" | "saving" | "saved" | "error";

function StatusContent({
  status,
  message,
}: {
  status: SaveBarStatus;
  message?: string | null;
}) {
  if (status === "saving") {
    return (
      <p
        role="status"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-stone-600"
      >
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        Saving…
      </p>
    );
  }
  if (status === "saved") {
    return (
      <p
        role="status"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-emerald-700"
      >
        <Check className="size-4 shrink-0" aria-hidden />
        All changes saved
      </p>
    );
  }
  if (status === "error") {
    return (
      <p
        role="alert"
        title={message ?? undefined}
        className="min-w-0 flex-1 truncate text-sm font-medium text-red-600"
      >
        Couldn&apos;t save{message ? ` — ${message}` : ". Please try again."}
      </p>
    );
  }
  if (status === "dirty") {
    return (
      <p className="min-w-0 flex-1 text-sm font-medium text-amber-700">
        Unsaved changes
      </p>
    );
  }
  return (
    <p className="min-w-0 flex-1 text-sm text-stone-400">No unsaved changes</p>
  );
}

/**
 * One consistent save action area for the whole Career Card Builder.
 * Sticky top bar on lg+; compact fixed bottom bar below lg.
 * The Save button is enabled only when there is something to save —
 * it is disabled while clean, saved, or mid-save (double-submit guard).
 */
export function CareerCardSaveBar({
  status,
  message,
  onSave,
  onPreview,
}: {
  status: SaveBarStatus;
  message?: string | null;
  onSave: () => void;
  onPreview?: () => void;
}) {
  const canSave = status === "dirty" || status === "error";

  return (
    <>
      {/* Top action bar — lg+ (sticky while scrolling) */}
      <div className="sticky top-3 z-30 hidden items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm lg:flex">
        <StatusContent status={status} message={message} />
        {onPreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="shrink-0"
          >
            <Eye className="size-3.5" aria-hidden />
            Preview
          </Button>
        )}
        <Button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="shrink-0 bg-emerald-700 hover:bg-emerald-800"
        >
          {status === "saving" ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Bottom action bar — below lg (always reachable, safe-area aware) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <StatusContent status={status} message={message} />
          <Button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800"
          >
            {status === "saving" ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}
