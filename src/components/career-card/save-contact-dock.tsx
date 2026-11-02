"use client";

import { UserRoundPlus } from "lucide-react";
import type { CSSProperties } from "react";
import { CRIMSON_NIGHT_VARS } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-parts";

export interface SaveContactAction {
  filename: string;
  /** Builds the vCard text lazily so relative photo/logo URLs can be
   *  absolutized against the current origin. */
  build: () => string;
}

/**
 * Persistent "Save Contact" dock for the public Career Card.
 *
 * A single fixed bottom action bar at every breakpoint — card-width
 * (max-w-[430px]) so it aligns with the card and never stretches across
 * wide monitors, with safe-area padding for mobile toolbars. The parent
 * <main> carries matching bottom padding so the bar never covers card
 * content at the end of a scroll.
 *
 * One shared behavior; `variant` picks the light accent-token treatment
 * used by the light skins or Crimson Night's dark token system.
 */
export function SaveContactDock({
  contact,
  variant,
  accentStyle,
}: {
  contact: SaveContactAction | null;
  variant: "light" | "dark";
  accentStyle?: CSSProperties;
}) {
  if (!contact) return null;

  const dark = variant === "dark";
  const onSave = () => {
    const vcf = contact.build();
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = contact.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const btn = dark
    ? "flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cn-cta)] px-5 py-3.5 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_rgba(185,28,28,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--cn-cta-hover)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-10px_rgba(185,28,28,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cn-hi)] active:translate-y-0"
    : "flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nfc-cta)] px-5 py-3.5 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-10px_var(--nfc-cta)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--nfc-cta-hover)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_14px_28px_-10px_var(--nfc-cta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)] active:translate-y-0";

  const bar = dark
    ? "rounded-2xl border border-white/10 bg-stone-950/85 p-2 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur"
    : "rounded-2xl border border-stone-200/80 bg-white/90 p-2 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.22)] backdrop-blur";

  return (
    <div style={dark ? CRIMSON_NIGHT_VARS : accentStyle}>
      {/* Single persistent bottom bar at all breakpoints — one visible
          Save Contact action, card-width, safe-area aware. */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className={`mx-auto w-full max-w-[430px] ${bar}`}>
          <button
            type="button"
            onClick={onSave}
            className={btn}
            aria-label="Save contact"
          >
            <UserRoundPlus className="size-4" aria-hidden />
            Save Contact
          </button>
        </div>
      </div>
    </div>
  );
}
