"use client";

import { Check, Copy, ExternalLink, Globe, Link2, Palette } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  CAREER_CARD_THEMES,
  type CareerCardThemeId,
} from "@/lib/career-card-themes";

import {
  createPublicProfileAction,
  publishPublicProfileAction,
  savePublicProfileSettingsAction,
  unpublishPublicProfileAction,
  updateSlugAction,
} from "@/app/candidate/(workspace)/public-profile/actions";
import { CareerCardNfcWriter } from "@/components/candidate/public-profile/career-card-nfc-writer";
import { Button } from "@/components/ui/button";

type VariantOption = {
  id: string;
  name: string;
  targetRole: string;
  targetCountry: string;
};

export type PublicProfileSettingsState = {
  publicHeadline: string;
  publicBio: string;
  publicLocation: string;
  currentFocus: string;
  workAuthorization: string;
  openToOpportunities: boolean;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showCertifications: boolean;
  showLanguages: boolean;
  featuredResumeVariantId: string;
  themeId: CareerCardThemeId;
};

const VISIBILITY_SECTIONS: {
  key: keyof Pick<
    PublicProfileSettingsState,
    | "showExperience"
    | "showEducation"
    | "showSkills"
    | "showProjects"
    | "showCertifications"
    | "showLanguages"
  >;
  label: string;
}[] = [
  { key: "showExperience", label: "Experience" },
  { key: "showEducation", label: "Education" },
  { key: "showSkills", label: "Skills" },
  { key: "showProjects", label: "Projects" },
  { key: "showCertifications", label: "Certifications" },
  { key: "showLanguages", label: "Languages" },
];

export function PublicProfileSettings({
  slug,
  isPublished,
  shareUrl,
  publicUrl,
  initial,
  variants,
}: {
  slug: string | null;
  isPublished: boolean;
  /** Permanent NFC/share URL, e.g. https://origin/n/<token>. */
  shareUrl: string | null;
  /** Current public URL, e.g. /u/<slug> — null until created. */
  publicUrl: string | null;
  initial: PublicProfileSettingsState | null;
  variants: VariantOption[];
}) {
  const [slugValue, setSlugValue] = useState(slug ?? "");
  const [form, setForm] = useState<PublicProfileSettingsState>(
    initial ?? {
      publicHeadline: "",
      publicBio: "",
      publicLocation: "",
      currentFocus: "",
      workAuthorization: "",
      openToOpportunities: false,
      linkedinUrl: "",
      githubUrl: "",
      websiteUrl: "",
      showExperience: false,
      showEducation: false,
      showSkills: false,
      showProjects: false,
      showCertifications: false,
      showLanguages: false,
      featuredResumeVariantId: "",
      themeId: "role-race-classic",
    },
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run(
    fn: () => Promise<{ success: boolean; message?: string }>,
    markSaved = false,
  ) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await fn();
      if (!r.success) setError(r.message ?? "Something went wrong.");
      else if (markSaved) setSaved(true);
    });
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  /* ---------- not yet created ---------- */
  if (!slug) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold text-stone-900">
          Create your Career Card
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          This creates your public Career Card page and its permanent share
          link. You can publish and customize it later.
        </p>
        <Button
          type="button"
          onClick={() => run(createPublicProfileAction)}
          disabled={isPending}
          className="mt-4 bg-emerald-700 hover:bg-emerald-800"
        >
          <Globe className="size-4" aria-hidden />
          {isPending ? "Creating…" : "Create Career Card"}
        </Button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-600/20";
  const labelCls =
    "text-xs font-semibold tracking-wide text-stone-500 uppercase";

  return (
    <div className="space-y-5">
      {/* public profile card */}
      <section
        aria-labelledby="pp-profile"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="pp-profile"
              className="text-base font-semibold text-stone-900"
            >
              Career Card
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-stone-600">
              Status:{" "}
              {isPublished ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Check className="size-3" aria-hidden /> Published
                </span>
              ) : (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                  Not published
                </span>
              )}
            </p>
          </div>
          {isPublished ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => run(unpublishPublicProfileAction)}
              disabled={isPending}
            >
              {isPending ? "Updating…" : "Unpublish profile"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => run(publishPublicProfileAction)}
              disabled={isPending}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Globe className="size-4" aria-hidden />
              {isPending ? "Publishing…" : "Publish profile"}
            </Button>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="pp-slug" className={labelCls}>
            Public URL
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-stone-200 focus-within:ring-2 focus-within:ring-emerald-600/30">
              <span className="pl-3 text-sm text-stone-400">/u/</span>
              <input
                id="pp-slug"
                type="text"
                value={slugValue}
                onChange={(e) => setSlugValue(e.target.value)}
                className="min-w-0 flex-1 rounded-r-lg bg-transparent px-1.5 py-2 text-sm font-medium text-stone-900 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => run(() => updateSlugAction(slugValue))}
              disabled={isPending || slugValue.trim().toLowerCase() === slug}
            >
              Save
            </Button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            Lowercase letters, numbers, and hyphens. Changing this does not
            affect your permanent Career Card link below.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Preview Career Card
          </Link>
        )}
      </section>

      {/* public identity */}
      <section
        aria-labelledby="pp-identity"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <h2 id="pp-identity" className="text-base font-semibold text-stone-900">
          Public identity
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Shown on your public page. If left empty, your Career Profile headline
          and summary are used.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="pp-headline" className={labelCls}>
              Public headline
            </label>
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
          <div>
            <label htmlFor="pp-bio" className={labelCls}>
              Public About
            </label>
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
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["publicLocation", "Public location", "Berlin, Germany"],
                ["currentFocus", "Current focus", "AI product strategy"],
                [
                  "workAuthorization",
                  "Work authorization",
                  "EU work authorization",
                ],
              ] as const
            ).map(([key, label, ph]) => (
              <div key={key}>
                <label htmlFor={`pp-${key}`} className={labelCls}>
                  {label}
                </label>
                <input
                  id={`pp-${key}`}
                  type="text"
                  value={form[key]}
                  maxLength={200}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className={`mt-1.5 ${inputCls}`}
                  placeholder={ph}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
            <div>
              <label
                htmlFor="pp-openToOpportunities"
                className="text-sm font-medium text-stone-800"
              >
                Open to opportunities
              </label>
              <p className="text-xs text-stone-500">
                Shows an availability badge on your Career Card.
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
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
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
      </section>

      {/* visibility */}
      <section
        aria-labelledby="pp-visibility"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <h2
          id="pp-visibility"
          className="text-base font-semibold text-stone-900"
        >
          Visibility
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Choose which Career Profile sections appear on your public page.
          Hiding a section never removes it from your Career Profile.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {VISIBILITY_SECTIONS.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3"
            >
              <label
                htmlFor={`pp-${s.key}`}
                className="text-sm font-medium text-stone-800"
              >
                {s.label}
              </label>
              <button
                id={`pp-${s.key}`}
                type="button"
                role="switch"
                aria-checked={form[s.key]}
                aria-label={`Show ${s.label} on Career Card`}
                onClick={() => setForm((f) => ({ ...f, [s.key]: !f[s.key] }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  form[s.key] ? "bg-emerald-600" : "bg-stone-300"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                    form[s.key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* featured resume */}
      <section
        aria-labelledby="pp-featured"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <h2 id="pp-featured" className="text-base font-semibold text-stone-900">
          Featured resume
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Optionally highlight one of your saved resumes on your public page.
        </p>
        <label htmlFor="pp-variant" className="sr-only">
          Featured resume
        </label>
        <select
          id="pp-variant"
          value={form.featuredResumeVariantId}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              featuredResumeVariantId: e.target.value,
            }))
          }
          className={`mt-3 ${inputCls}`}
        >
          <option value="">No featured resume</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.targetRole} · {v.targetCountry}
            </option>
          ))}
        </select>
      </section>

      {/* links */}
      <section
        aria-labelledby="pp-links"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <h2 id="pp-links" className="text-base font-semibold text-stone-900">
          Links
        </h2>
        <div className="mt-4 space-y-4">
          {(
            [
              ["linkedinUrl", "LinkedIn", "https://linkedin.com/in/…"],
              ["githubUrl", "GitHub", "https://github.com/…"],
              ["websiteUrl", "Website", "https://…"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key}>
              <label htmlFor={`pp-${key}`} className={labelCls}>
                {label}
              </label>
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
      </section>

      {/* save */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() =>
            run(() =>
              savePublicProfileSettingsAction({
                publicHeadline: form.publicHeadline,
                publicBio: form.publicBio,
                publicLocation: form.publicLocation,
                currentFocus: form.currentFocus,
                workAuthorization: form.workAuthorization,
                openToOpportunities: form.openToOpportunities,
                linkedinUrl: form.linkedinUrl,
                githubUrl: form.githubUrl,
                websiteUrl: form.websiteUrl,
                showExperience: form.showExperience,
                showEducation: form.showEducation,
                showSkills: form.showSkills,
                showProjects: form.showProjects,
                showCertifications: form.showCertifications,
                showLanguages: form.showLanguages,
                featuredResumeVariantId: form.featuredResumeVariantId || null,
                themeId: form.themeId,
              }),
            )
          }
          disabled={isPending}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          {isPending ? "Saving…" : "Save profile"}
        </Button>
        {saved && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            Saved
          </p>
        )}
      </div>

      {/* theme selector */}
      <section
        aria-labelledby="pp-appearance"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <h2
          id="pp-appearance"
          className="flex items-center gap-2 text-base font-semibold text-stone-900"
        >
          <Palette className="size-4 text-emerald-700" aria-hidden />
          Career Card Appearance
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Choose how your public Career Card looks. Changes apply after Save
          profile — your link and data stay the same.
        </p>
        <fieldset className="mt-4">
          <legend className="sr-only">Career Card theme</legend>
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
      </section>

      {/* permanent card link */}
      {shareUrl && (
        <section
          aria-labelledby="pp-card-link"
          className="rounded-2xl border border-stone-200 bg-white p-6"
        >
          <h2
            id="pp-card-link"
            className="flex items-center gap-2 text-base font-semibold text-stone-900"
          >
            <Link2 className="size-4 text-emerald-700" aria-hidden />
            Career Card Link
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Use this permanent link for your NFC card or QR code. You can update
            your Career Card later without changing this link.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700">
              {shareUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              aria-live="polite"
            >
              <Copy className="size-3.5" aria-hidden />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(shareUrl, "_blank", "noreferrer")}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Open link
            </Button>
          </div>
        </section>
      )}

      {/* program physical NFC card — browser-side only, no server writes */}
      {shareUrl && <CareerCardNfcWriter careerCardUrl={shareUrl} />}
    </div>
  );
}

/** CSS-only miniature of the public card — a real skeleton, not a screenshot. */
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
