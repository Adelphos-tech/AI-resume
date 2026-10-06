"use client";

import { Briefcase, MapPin } from "lucide-react";

import type { PublicProfileSettingsState } from "./public-profile-settings";

const inputCls =
  "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-600/20";
const labelCls = "text-xs font-semibold tracking-wide text-stone-500 uppercase";

export function CareerCardIdentitySettings({
  form,
  setForm,
}: {
  form: PublicProfileSettingsState;
  setForm: React.Dispatch<React.SetStateAction<PublicProfileSettingsState>>;
}) {
  return (
    <div className="space-y-5">
      {/* Headline */}
      <div>
        <label htmlFor="pp-headline" className={labelCls}>
          Headline
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          A short professional headline shown on your card.
        </p>
        <input
          id="pp-headline"
          type="text"
          value={form.publicHeadline}
          maxLength={300}
          onChange={(e) =>
            setForm((f) => ({ ...f, publicHeadline: e.target.value }))
          }
          className={`mt-1.5 ${inputCls}`}
          placeholder="Senior Product Manager · AI products"
        />
      </div>

      {/* About */}
      <div>
        <label htmlFor="pp-bio" className={labelCls}>
          About
        </label>
        <p className="mt-0.5 text-sm text-stone-500">
          Introduce yourself in a few sentences.
        </p>
        <textarea
          id="pp-bio"
          value={form.publicBio}
          maxLength={1500}
          rows={4}
          onChange={(e) =>
            setForm((f) => ({ ...f, publicBio: e.target.value }))
          }
          className={`mt-1.5 resize-none ${inputCls}`}
          placeholder="A short professional introduction for public viewers."
        />
        <p className="mt-1 text-xs text-stone-400">
          {form.publicBio.length}/1500
        </p>
      </div>

      {/* Location / Focus / Work auth */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="pp-publicLocation" className={labelCls}>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              Location
            </span>
          </label>
          <p className="mt-0.5 text-sm text-stone-500">
            Where you&apos;re currently based.
          </p>
          <input
            id="pp-publicLocation"
            type="text"
            value={form.publicLocation}
            maxLength={200}
            onChange={(e) =>
              setForm((f) => ({ ...f, publicLocation: e.target.value }))
            }
            className={`mt-1.5 ${inputCls}`}
            placeholder="Berlin, Germany"
          />
        </div>
        <div>
          <label htmlFor="pp-currentFocus" className={labelCls}>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3" aria-hidden />
              Current focus
            </span>
          </label>
          <p className="mt-0.5 text-sm text-stone-500">
            What you&apos;re focused on right now.
          </p>
          <input
            id="pp-currentFocus"
            type="text"
            value={form.currentFocus}
            maxLength={200}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentFocus: e.target.value }))
            }
            className={`mt-1.5 ${inputCls}`}
            placeholder="AI product strategy"
          />
        </div>
        <div>
          <label htmlFor="pp-workAuthorization" className={labelCls}>
            Work authorization
          </label>
          <p className="mt-0.5 text-sm text-stone-500">
            Your current authorization status.
          </p>
          <input
            id="pp-workAuthorization"
            type="text"
            value={form.workAuthorization}
            maxLength={200}
            onChange={(e) =>
              setForm((f) => ({ ...f, workAuthorization: e.target.value }))
            }
            className={`mt-1.5 ${inputCls}`}
            placeholder="EU work authorization"
          />
        </div>
      </div>

      {/* Open to opportunities */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label
              htmlFor="pp-openToOpportunities"
              className="text-sm font-semibold text-stone-900"
            >
              Open to opportunities
            </label>
            <p className="mt-0.5 text-sm text-stone-500">
              Show an availability badge on your Career Card when published.
            </p>
          </div>
          <button
            id="pp-openToOpportunities"
            type="button"
            role="switch"
            aria-checked={form.openToOpportunities}
            aria-label="Show open to opportunities badge"
            onClick={() =>
              setForm((f) => ({
                ...f,
                openToOpportunities: !f.openToOpportunities,
              }))
            }
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
              form.openToOpportunities ? "bg-emerald-600" : "bg-stone-300"
            }`}
          >
            <span
              aria-hidden
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                form.openToOpportunities ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
