"use client";

import { Check, Sparkles, LayoutPanelTop } from "lucide-react";

import {
  CAREER_CARD_THEMES,
  type CareerCardThemeId,
  type ThemeRecommendation,
} from "@/lib/career-card-themes";
import { CAREER_CARD_ACCENT_COLORS } from "@/lib/career-card-accent-colors";
import { CAREER_CARD_STYLES } from "@/lib/career-card-styles";
import {
  NFC_COMPACT_SKINS,
  type NfcCompactSkinId,
} from "@/lib/nfc-compact-skins";
import type { PublicProfileSettingsState } from "./public-profile-settings";

export type CareerCardDesignSettingsProps = {
  form: PublicProfileSettingsState;
  setForm: React.Dispatch<React.SetStateAction<PublicProfileSettingsState>>;
  reco: ThemeRecommendation | null;
  setReco: (reco: ThemeRecommendation | null) => void;
  recoBusy: boolean;
  setRecoBusy: (busy: boolean) => void;
  recoErr: string | null;
  setRecoErr: (err: string | null) => void;
};

export function CareerCardDesignSettings({
  form,
  setForm,
  reco,
  setReco,
  recoBusy,
  setRecoBusy,
  recoErr,
  setRecoErr,
}: CareerCardDesignSettingsProps) {
  return (
    <div className="space-y-8">
      {/* ── Theme ── */}
      <fieldset>
        <legend className="sr-only">Career Card theme</legend>

        {/* AI recommendation — explicit candidate action only; nothing is
             auto-applied or persisted. */}
        <div className="mb-4">
          <button
            type="button"
            disabled={recoBusy}
            onClick={async () => {
              setRecoErr(null);
              setRecoBusy(true);
              try {
                const res = await fetch(
                  "/api/candidate/public-profile/theme-recommendation",
                  { method: "POST" },
                );
                const r: {
                  success: boolean;
                  recommendation?: ThemeRecommendation;
                  message?: string;
                } = await res.json().catch(() => ({ success: false }));
                if (!r.success || !r.recommendation) {
                  setRecoErr(
                    r.message ??
                      "Unable to get a recommendation right now. Please try again.",
                  );
                } else {
                  setReco(r.recommendation);
                }
              } catch {
                setRecoErr(
                  "Unable to get a recommendation right now. Please try again.",
                );
              } finally {
                setRecoBusy(false);
              }
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/60 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:border-emerald-600/60 disabled:opacity-50"
          >
            {recoBusy ? "Recommending…" : "Recommend a theme with AI"}
          </button>
          {recoErr && (
            <p role="alert" className="mt-2 text-sm text-stone-600">
              {recoErr}
            </p>
          )}
        </div>

        {reco && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Recommended for you
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {reco.label}
            </p>
            <ul className="mt-2 space-y-1">
              {reco.reasons.map((r, i) => (
                <li key={i} className="text-sm text-stone-600">
                  • {r}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    themeId: reco.recommendedThemeId,
                  }))
                }
                className="inline-flex min-h-9 items-center rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Use {reco.label}
              </button>
              <button
                type="button"
                onClick={() => setReco(null)}
                className="inline-flex min-h-9 items-center rounded-lg border border-stone-200 px-4 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300"
              >
                Dismiss
              </button>
            </div>
            {reco.alternatives.length > 0 && (
              <div className="mt-3 border-t border-emerald-200/60 pt-3">
                <p className="text-xs font-semibold text-stone-500">
                  Also consider
                </p>
                <ul className="mt-1 space-y-1">
                  {reco.alternatives.map((a) => (
                    <li key={a.themeId} className="text-sm text-stone-600">
                      <span className="font-medium text-stone-800">
                        {a.label}
                      </span>{" "}
                      — {a.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-xs text-stone-400">
              Recommendation is a suggestion only — your theme changes only
              after you select and Save profile.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {CAREER_CARD_THEMES.map((t) => {
            const selected = form.themeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm((f) => ({ ...f, themeId: t.id }))}
                className={`group rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  selected
                    ? "border-emerald-600 bg-emerald-50/40"
                    : "border-stone-200 hover:border-emerald-600/40"
                }`}
              >
                <ThemeMiniPreview themeId={t.id} />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {t.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                      {t.description}
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      selected
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-800"
                    }`}
                  >
                    {selected && <Check className="size-3" aria-hidden />}
                    {selected ? "Selected" : "Use theme"}
                  </span>
                </div>
                <ul className="mt-2 flex flex-wrap gap-1">
                  {t.fits.map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Appearance — NFC Compact skins only ── */}
      {form.themeId === "nfc-compact" && (
        <fieldset>
          <legend className="text-sm font-semibold text-stone-900">
            Appearance
          </legend>
          <p className="mt-1 mb-3 text-xs text-stone-500">
            Choose how your NFC Compact Career Card looks. Accent color is
            independent of appearance.
          </p>
          <div
            role="radiogroup"
            aria-label="Career Card appearance"
            className="grid gap-2 sm:grid-cols-2"
          >
            {NFC_COMPACT_SKINS.map((sk) => {
              const selected = form.nfcCompactSkinId === sk.id;
              return (
                <button
                  key={sk.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    setForm((f) => ({ ...f, nfcCompactSkinId: sk.id }))
                  }
                  className={`group rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <SkinMiniPreview skinId={sk.id} />
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {sk.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                        {sk.description}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        selected
                          ? "bg-emerald-700 text-white"
                          : "bg-stone-100 text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-800"
                      }`}
                    >
                      {selected && <Check className="size-3" aria-hidden />}
                      {selected ? "Selected" : "Use"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* ── Accent color ── */}
      <fieldset>
        <legend className="text-sm font-semibold text-stone-900">
          Accent color
        </legend>
        <p className="mt-1 mb-3 text-xs text-stone-500">
          Choose the accent used for buttons, highlights, and details on your
          Career Card.
        </p>
        <div
          role="radiogroup"
          aria-label="Accent color"
          className="grid gap-2 sm:grid-cols-2"
        >
          {CAREER_CARD_ACCENT_COLORS.map((a) => {
            const selected = form.accentColorId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm((f) => ({ ...f, accentColorId: a.id }))}
                className={`group rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  selected
                    ? "border-emerald-600 bg-emerald-50/40"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={`size-6 shrink-0 rounded-full ${a.swatchClass}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-900">
                    {a.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      selected
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                    }`}
                  >
                    {selected && <Check className="size-3" aria-hidden />}
                    {selected ? "Selected" : "Use"}
                  </span>
                </span>
                <span className="mt-1 block truncate text-xs text-stone-500">
                  {a.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Card style ── */}
      <fieldset>
        <legend className="text-sm font-semibold text-stone-900">
          Card Style
        </legend>
        <p className="mt-1 mb-3 text-xs text-stone-500">
          Choose how your Career Card presents your professional identity.
        </p>
        <div
          role="radiogroup"
          aria-label="Card style"
          className="grid gap-2 sm:grid-cols-2"
        >
          {CAREER_CARD_STYLES.map((s) => {
            const selected = form.cardStyleId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm((f) => ({ ...f, cardStyleId: s.id }))}
                className={`group rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  selected
                    ? "border-emerald-600 bg-emerald-50/40"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`grid size-10 shrink-0 place-items-center rounded-lg border ${
                      selected
                        ? "border-emerald-600/40 bg-emerald-50"
                        : "border-stone-200 bg-stone-50"
                    }`}
                  >
                    {s.id === "premium" ? (
                      <Sparkles
                        className={`size-4 ${selected ? "text-emerald-700" : "text-stone-500"}`}
                      />
                    ) : (
                      <LayoutPanelTop
                        className={`size-4 ${selected ? "text-emerald-700" : "text-stone-500"}`}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-stone-900">
                    {s.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      selected
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                    }`}
                  >
                    {selected && <Check className="size-3" aria-hidden />}
                    {selected ? "Selected" : "Use"}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-snug text-stone-500">
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function ThemeMiniPreview({ themeId }: { themeId: CareerCardThemeId }) {
  const bar = (w: string, cls: string) => (
    <span className={`block h-1.5 rounded-full ${w} ${cls}`} />
  );
  switch (themeId) {
    case "corporate-clean":
      return (
        <div aria-hidden className="h-24 w-full rounded-lg bg-stone-100 p-2">
          <div className="h-full w-full rounded-md border border-stone-200 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-md bg-stone-900" />
              <div className="flex-1 space-y-1">
                {bar("w-2/5", "bg-stone-800")}
                {bar("w-3/5", "bg-emerald-700/40")}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {bar("w-full", "bg-stone-200")}
              {bar("w-4/5", "bg-stone-200")}
            </div>
            <div className="mt-2 flex gap-1">
              <span className="h-2.5 w-8 rounded-md border border-stone-200 bg-stone-50" />
              <span className="h-2.5 w-8 rounded-md border border-stone-200 bg-stone-50" />
            </div>
          </div>
        </div>
      );
    case "executive-dark":
      return (
        <div aria-hidden className="h-24 w-full rounded-lg bg-stone-950 p-2">
          <div className="h-full w-full rounded-md border border-stone-800 bg-stone-900 p-2.5">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800" />
              <div className="flex-1 space-y-1">
                {bar("w-2/5", "bg-stone-200")}
                {bar("w-3/5", "bg-emerald-500/50")}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {bar("w-full", "bg-stone-700")}
              {bar("w-4/5", "bg-stone-700")}
            </div>
            <div className="mt-2 flex gap-1">
              <span className="h-2.5 w-8 rounded-full border border-stone-700 bg-stone-800" />
              <span className="h-2.5 w-8 rounded-full border border-stone-700 bg-stone-800" />
            </div>
          </div>
        </div>
      );
    case "tech-minimal":
      return (
        <div
          aria-hidden
          className="h-24 w-full rounded-lg bg-white p-2 ring-1 ring-neutral-200"
        >
          <div className="h-full w-full rounded-md border border-neutral-200 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-neutral-900 font-mono text-[8px] font-bold text-emerald-400">
                {"<>"}
              </span>
              <div className="flex-1 space-y-1">
                {bar("w-2/5", "bg-neutral-800")}
                {bar("w-3/5", "bg-neutral-300")}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {bar("w-full", "bg-neutral-200")}
              {bar("w-4/5", "bg-neutral-200")}
            </div>
            <div className="mt-2 flex gap-1">
              <span className="h-2.5 w-8 rounded-md border border-neutral-200 bg-neutral-50" />
              <span className="h-2.5 w-8 rounded-md border border-neutral-200 bg-neutral-50" />
              <span className="h-2.5 w-8 rounded-md border border-neutral-200 bg-neutral-50" />
            </div>
          </div>
        </div>
      );
    case "nfc-compact":
      return (
        <div
          aria-hidden
          className="h-24 w-full rounded-lg bg-gradient-to-b from-sky-50 to-white p-2"
        >
          <div className="h-full w-full rounded-md border border-sky-200 bg-white p-2.5 shadow-sm">
            <div className="mx-auto flex w-4/5 items-center rounded-full bg-sky-100 p-0.5">
              <span className="flex-1 rounded-full bg-blue-900 py-0.5 text-center text-[7px] font-bold text-white">
                Candidate
              </span>
              <span className="flex-1 py-0.5 text-center text-[7px] font-bold text-blue-900/50">
                Company
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="size-6 rounded-full bg-sky-100 ring-1 ring-blue-900/40" />
              <div className="flex-1 space-y-1">
                {bar("w-2/5", "bg-blue-950")}
                {bar("w-3/5", "bg-sky-300")}
              </div>
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="h-4 flex-1 rounded-md border border-sky-100 bg-sky-50" />
              <span className="h-4 flex-1 rounded-md border border-sky-100 bg-sky-50" />
              <span className="h-4 flex-1 rounded-md border border-sky-100 bg-sky-50" />
            </div>
            <span className="mt-1.5 block h-3 w-full rounded-md bg-blue-900" />
          </div>
        </div>
      );
    case "role-race-classic":
    default:
      return (
        <div
          aria-hidden
          className="h-24 w-full rounded-lg bg-gradient-to-b from-emerald-50 to-stone-50 p-2"
        >
          <div className="h-full w-full rounded-md border border-stone-200 bg-white p-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-emerald-700 ring-2 ring-emerald-100" />
              <div className="flex-1 space-y-1">
                {bar("w-2/5", "bg-stone-800")}
                {bar("w-3/5", "bg-stone-300")}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {bar("w-full", "bg-stone-200")}
              {bar("w-4/5", "bg-stone-200")}
            </div>
            <div className="mt-2 flex gap-1">
              <span className="h-2.5 w-8 rounded-full border border-emerald-600/20 bg-emerald-50" />
              <span className="h-2.5 w-8 rounded-full border border-emerald-600/20 bg-emerald-50" />
            </div>
          </div>
        </div>
      );
  }
}

function SkinMiniPreview({ skinId }: { skinId: NfcCompactSkinId }) {
  if (skinId === "crimson-night") {
    return (
      <div className="relative h-16 overflow-hidden rounded-lg bg-[#09090B] ring-1 ring-white/10">
        <span className="absolute inset-y-0 left-0 w-1 bg-[#B91C1C]" />
        <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-white/80" />
        <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-[#EF4444]/70" />
        <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-[#B91C1C]" />
      </div>
    );
  }
  if (skinId === "professional-connect") {
    return (
      <div className="relative h-16 overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-200">
        <span className="absolute top-0 right-0 left-0 h-0.5 bg-blue-800/40" />
        <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-slate-800" />
        <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-blue-800/60" />
        <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-blue-800" />
      </div>
    );
  }
  if (skinId === "creative-spotlight") {
    return (
      <div className="relative h-16 overflow-hidden rounded-lg bg-gradient-to-b from-amber-50/60 to-white ring-1 ring-amber-200/60">
        <span className="absolute top-0 right-0 left-0 h-0.5 bg-amber-700/40" />
        <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-stone-800" />
        <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-amber-700/60" />
        <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-amber-700" />
      </div>
    );
  }
  if (skinId === "signature-spotlight") {
    return (
      <div className="relative h-16 overflow-hidden rounded-lg bg-gradient-to-b from-white to-stone-50 ring-1 ring-stone-200/60">
        <span className="absolute top-0 right-0 left-0 h-0.5 bg-[var(--nfc-cta)]/40" />
        <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-stone-800" />
        <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-stone-400/60" />
        <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-[var(--nfc-cta)]" />
      </div>
    );
  }
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-[#fafaf9] ring-1 ring-stone-200">
      <span className="absolute inset-y-0 left-0 w-1 bg-emerald-700" />
      <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-stone-800" />
      <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-emerald-700/60" />
      <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-emerald-700" />
    </div>
  );
}
