"use client";

import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CompanyProfileState } from "./company-profile-settings";

const inputCls =
  "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-600/20";
const labelCls = "text-xs font-semibold tracking-wide text-stone-500 uppercase";

export type CareerCardCompanyIdentitySettingsProps = {
  form: CompanyProfileState;
  setForm: React.Dispatch<React.SetStateAction<CompanyProfileState>>;
  logo: string | null;
  logoV: number;
  logoBusy: boolean;
  logoMsg: string | null;
  logoRef: React.RefObject<HTMLInputElement | null>;
  onLogoSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
};

export function CareerCardCompanyIdentitySettings({
  form,
  setForm,
  logo,
  logoV,
  logoBusy,
  logoMsg,
  logoRef,
  onLogoSelected,
  onRemoveLogo,
}: CareerCardCompanyIdentitySettingsProps) {
  const set = <K extends keyof CompanyProfileState>(
    key: K,
    value: CompanyProfileState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Company name */}
      <div>
        <label htmlFor="cp-name" className={labelCls}>
          Company name
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          The name shown on your company profile.
        </p>
        <input
          id="cp-name"
          value={form.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          className={`mt-1.5 ${inputCls}`}
          placeholder="Acme Platforms"
        />
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="cp-tagline" className={labelCls}>
          Tagline
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          A short description of what your company does.
        </p>
        <input
          id="cp-tagline"
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          className={`mt-1.5 ${inputCls}`}
          placeholder="Enterprise agentic platforms"
        />
      </div>

      {/* Logo */}
      <div>
        <p className={labelCls}>Company logo</p>
        <p className="mt-0.5 text-sm text-stone-500">
          Horizontal, square or tall — your logo keeps its proportions.
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${logo}?v=${logoV}`}
                alt="Company logo"
                className="h-20 w-auto max-w-44 rounded-xl border border-stone-200 bg-white object-contain p-1 ring-4 ring-stone-50"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 ring-4 ring-stone-50">
                <ImagePlus className="size-6" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={logoBusy}
                onClick={() => logoRef.current?.click()}
              >
                <ImagePlus className="size-3.5" aria-hidden />
                {logoBusy
                  ? "Uploading…"
                  : logo
                    ? "Replace logo"
                    : "Upload logo"}
              </Button>
              {logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={logoBusy}
                  onClick={onRemoveLogo}
                  className="text-stone-600 hover:text-red-700"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remove
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">
              JPG, PNG or WebP · up to 8 MB
            </p>
            {logoMsg && (
              <p
                role="status"
                className={`mt-1.5 text-xs font-medium ${
                  logoMsg.includes("updated") || logoMsg.includes("removed")
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {logoMsg}
              </p>
            )}
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Choose company logo"
            onChange={onLogoSelected}
          />
        </div>
      </div>

      {/* About */}
      <div>
        <label htmlFor="cp-about" className={labelCls}>
          About
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          Introduce your company in a few sentences.
        </p>
        <textarea
          id="cp-about"
          value={form.about}
          onChange={(e) => set("about", e.target.value)}
          rows={4}
          className={`mt-1.5 resize-none ${inputCls}`}
          placeholder="What your company does and who you serve…"
        />
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="cp-industry" className={labelCls}>
          Industry
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          The area your company works in.
        </p>
        <input
          id="cp-industry"
          value={form.industry}
          onChange={(e) => set("industry", e.target.value)}
          className={`mt-1.5 ${inputCls}`}
          placeholder="AI Platforms & Enterprise Software"
        />
      </div>
    </div>
  );
}
