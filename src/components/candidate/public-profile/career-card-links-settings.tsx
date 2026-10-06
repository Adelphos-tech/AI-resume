"use client";

import { WhatsappCountrySelect } from "@/components/candidate/public-profile/whatsapp-fields";
import type { PublicProfileSettingsState } from "./public-profile-settings";

const inputCls =
  "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-600/20";
const labelCls = "text-xs font-semibold tracking-wide text-stone-500 uppercase";

export function CareerCardLinksSettings({
  form,
  setForm,
}: {
  form: PublicProfileSettingsState;
  setForm: React.Dispatch<React.SetStateAction<PublicProfileSettingsState>>;
}) {
  return (
    <div className="space-y-6">
      {/* Social links */}
      <div className="space-y-4">
        {(
          [
            [
              "linkedinUrl",
              "LinkedIn",
              "https://linkedin.com/in/…",
              "Your professional profile link.",
            ],
            [
              "githubUrl",
              "GitHub",
              "https://github.com/…",
              "Your public development work.",
            ],
            [
              "websiteUrl",
              "Website",
              "https://…",
              "Your personal or professional site.",
            ],
          ] as const
        ).map(([key, label, placeholder, description]) => (
          <div key={key}>
            <label htmlFor={`pp-${key}`} className={labelCls}>
              {label}
            </label>
            <p className="mt-0.5 text-sm text-stone-500">{description}</p>
            <input
              id={`pp-${key}`}
              type="url"
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              className={`mt-1.5 ${inputCls}`}
              placeholder={placeholder}
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
        <div>
          <label htmlFor="pp-whatsapp" className={labelCls}>
            WhatsApp
          </label>
          <p className="mt-0.5 text-sm text-stone-500">
            Let recruiters reach you directly on WhatsApp.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
            <WhatsappCountrySelect
              id="pp-whatsapp-country"
              value={form.whatsappCountry}
              onChange={(v) => setForm((f) => ({ ...f, whatsappCountry: v }))}
              className={inputCls}
            />
            <input
              id="pp-whatsapp"
              inputMode="tel"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, whatsappNumber: e.target.value }))
              }
              className={inputCls}
              placeholder="98765 43210"
              autoComplete="off"
            />
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Show WhatsApp publicly
              </p>
              <p className="text-xs text-stone-500">
                {form.whatsappNumber.trim()
                  ? form.showWhatsapp
                    ? "Shown on your Career Card."
                    : "Saved privately — not shown publicly."
                  : "Pick a country and enter your number first."}
              </p>
            </div>
            <button
              id="pp-show-whatsapp"
              type="button"
              role="switch"
              aria-checked={form.showWhatsapp}
              aria-label="Show WhatsApp on Career Card"
              onClick={() =>
                setForm((f) => ({ ...f, showWhatsapp: !f.showWhatsapp }))
              }
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                form.showWhatsapp ? "bg-emerald-600" : "bg-stone-300"
              }`}
            >
              <span
                aria-hidden
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                  form.showWhatsapp ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
