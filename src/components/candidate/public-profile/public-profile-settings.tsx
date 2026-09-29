"use client";

import { Check, Copy, ExternalLink, Globe, Link2, Palette } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import {
  CAREER_CARD_THEMES,
  type CareerCardThemeId,
} from "@/lib/career-card-themes";

import {
  createPublicProfileAction,
  publishPublicProfileAction,
  removeCoverPhotoAction,
  removeProfilePhotoAction,
  updateCoverPositionAction,
  savePublicProfileSettingsAction,
  unpublishPublicProfileAction,
  updatePhotoPositionAction,
  updateSlugAction,
} from "@/app/candidate/(workspace)/public-profile/actions";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
  CoverPositionEditor,
  DEFAULT_PHOTO_POSITION,
  PhotoPositionEditor,
  type PhotoPosition,
} from "@/components/candidate/public-profile/career-card-photo";
import type { ThemeRecommendation } from "@/lib/career-card-themes";
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
  photoUrl,
  displayName,
  photoKey: initialPhotoKey,
  photoPosition,
  coverUrl,
  coverKey: initialCoverKey,
  coverPosition,
}: {
  slug: string | null;
  isPublished: boolean;
  /** Permanent NFC/share URL, e.g. https://origin/n/<token>. */
  shareUrl: string | null;
  /** Current public URL, e.g. /u/<slug> — null until created. */
  publicUrl: string | null;
  initial: PublicProfileSettingsState | null;
  variants: VariantOption[];
  /** Current public photo URL ("/u/<slug>/photo") or null for initials. */
  photoUrl: string | null;
  /** Candidate display name — used for photo alt text. */
  displayName: string;
  /** Opaque photo key — owner-scoped optimistic-concurrency token for the
   * position editor; never trusted for ownership server-side. */
  photoKey: string | null;
  photoPosition: PhotoPosition;
  /** Current public cover URL ("/u/<slug>/cover") or null for no cover. */
  coverUrl: string | null;
  /** Opaque cover key — owner-scoped optimistic-concurrency token for the
   * cover editor; never trusted for ownership server-side. */
  coverKey: string | null;
  coverPosition: PhotoPosition;
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
  const [photo, setPhoto] = useState<string | null>(photoUrl);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoV, setPhotoV] = useState(0);
  const [pos, setPos] = useState<PhotoPosition>(photoPosition);
  const [photoKey, setPhotoKey] = useState<string | null>(initialPhotoKey);
  const [cover, setCover] = useState<string | null>(coverUrl);
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverV, setCoverV] = useState(0);
  const coverRef = useRef<HTMLInputElement>(null);
  const [coverKey, setCoverKey] = useState<string | null>(initialCoverKey);
  const [coverPos, setCoverPos] = useState<PhotoPosition>(coverPosition);
  const [coverEditorOpen, setCoverEditorOpen] = useState(false);
  const adjustCoverBtnRef = useRef<HTMLButtonElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [posMsg, setPosMsg] = useState<string | null>(null);
  const [reco, setReco] = useState<ThemeRecommendation | null>(null);
  const [recoBusy, setRecoBusy] = useState(false);
  const [recoErr, setRecoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const adjustBtnRef = useRef<HTMLButtonElement>(null);

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

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setPhotoMsg(null);
    setPhotoBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/candidate/public-profile/photo", {
        method: "POST",
        body: fd,
      });
      const r: {
        success: boolean;
        photoUrl?: string;
        photoKey?: string;
        message?: string;
      } = await res.json().catch(() => ({ success: false }));
      if (!r.success) setPhotoMsg(r.message ?? "Upload failed. Try again.");
      else {
        setPhoto(r.photoUrl ?? null);
        setPhotoKey(r.photoKey ?? null);
        setPos(DEFAULT_PHOTO_POSITION); // new photo → centered presentation
        setPhotoV((v) => v + 1); // refresh the preview even at the same URL
        setPhotoMsg("Profile photo updated");
      }
    } catch {
      setPhotoMsg("Upload failed. Try again.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onRemovePhoto() {
    setPhotoMsg(null);
    setPhotoBusy(true);
    try {
      const r = await removeProfilePhotoAction();
      if (!r.success) setPhotoMsg(r.message);
      else {
        setPhoto(null);
        setPhotoKey(null);
        setPos(DEFAULT_PHOTO_POSITION);
        setPhotoMsg("Profile photo removed");
      }
    } catch {
      setPhotoMsg("Upload failed. Try again.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onCoverSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setCoverMsg(null);
    setCoverBusy(true);
    try {
      const fd = new FormData();
      fd.append("cover", file);
      const res = await fetch("/api/candidate/public-profile/cover-photo", {
        method: "POST",
        body: fd,
      });
      const r: {
        success: boolean;
        coverUrl?: string;
        coverKey?: string;
        message?: string;
      } = await res.json().catch(() => ({ success: false }));
      if (!r.success) setCoverMsg(r.message ?? "Upload failed. Try again.");
      else {
        setCover(r.coverUrl ?? null);
        setCoverKey(r.coverKey ?? null);
        setCoverV((v) => v + 1); // refresh the preview even at the same URL
        setCoverPos(DEFAULT_PHOTO_POSITION); // new cover → centered framing
        setCoverMsg("Cover photo updated");
      }
    } catch {
      setCoverMsg("Upload failed. Try again.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function onRemoveCover() {
    setCoverMsg(null);
    setCoverBusy(true);
    try {
      const r = await removeCoverPhotoAction();
      if (!r.success) setCoverMsg(r.message);
      else {
        setCover(null);
        setCoverKey(null);
        setCoverPos(DEFAULT_PHOTO_POSITION);
        setCoverMsg("Cover photo removed");
      }
    } catch {
      setCoverMsg("Upload failed. Try again.");
    } finally {
      setCoverBusy(false);
    }
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

        {/* profile photo — immediate media actions, separate from Save */}
        <div className="mt-5 border-t border-stone-200 pt-5">
          <p className="text-sm font-semibold text-stone-900">Profile photo</p>
          <div className="mt-3 flex items-center gap-4">
            {photo ? (
              <CareerCardProfilePhoto
                key={photoV}
                src={`${photo}?v=${photoV}`}
                alt={`${displayName} profile photo`}
                position={pos}
                frameClassName="size-16 rounded-full ring-4 ring-emerald-50"
              />
            ) : (
              <div
                aria-hidden
                className="grid size-16 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white ring-4 ring-emerald-50"
              >
                {displayName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0] ?? "")
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-stone-500">
                Add a professional photo to personalize your Career Card.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex min-h-10 items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
                >
                  {photoBusy
                    ? "Uploading…"
                    : photo
                      ? "Replace photo"
                      : "Upload photo"}
                </button>
                {photo && photoKey && (
                  <button
                    ref={adjustBtnRef}
                    type="button"
                    disabled={photoBusy}
                    onClick={() => {
                      setPosMsg(null);
                      setEditorOpen(true);
                    }}
                    className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/40 hover:text-emerald-800 disabled:opacity-50"
                  >
                    Adjust photo
                  </button>
                )}
                {photo && (
                  <button
                    type="button"
                    disabled={photoBusy}
                    onClick={onRemovePhoto}
                    className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-stone-400">
                JPG, PNG or WebP · up to 8 MB · applies immediately
              </p>
              {photoMsg && (
                <p
                  role="status"
                  className={`mt-1.5 text-xs font-medium ${
                    photoMsg.includes("ed") || photoMsg.includes("removed")
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {photoMsg}
                </p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              aria-label="Choose profile photo"
              onChange={onPhotoSelected}
            />
          </div>
        </div>

        {/* cover photo — presentation only; independent of the profile
            photo. Uploads go through the dedicated multipart route. */}
        <div className="mt-5 border-t border-stone-200 pt-5">
          <p className={labelCls}>Cover photo</p>
          {cover ? (
            <div className="mt-2 rounded-xl border border-stone-200 bg-stone-100">
              <CareerCardCoverPhoto
                src={`${cover}${cover.includes("?") ? "&" : "?"}v=${coverV}`}
                alt=""
                position={coverPos}
                frameClassName="aspect-2/1 w-full rounded-xl"
              />
            </div>
          ) : (
            <div className="mt-2 grid aspect-2/1 w-full place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400">
              Add a cover photo
            </div>
          )}
          <p className="mt-2 text-sm text-stone-500">
            Add a wide image to personalize your Career Card.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={coverBusy}
              onClick={() => coverRef.current?.click()}
              className="inline-flex min-h-10 items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              {coverBusy ? "Uploading…" : cover ? "Replace" : "Upload cover"}
            </button>
            {cover && coverKey && (
              <button
                ref={adjustCoverBtnRef}
                type="button"
                disabled={coverBusy}
                onClick={() => {
                  setCoverMsg(null);
                  setCoverEditorOpen(true);
                }}
                className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/40 hover:text-emerald-800 disabled:opacity-50"
              >
                Adjust cover
              </button>
            )}
            {cover && (
              <button
                type="button"
                disabled={coverBusy}
                onClick={onRemoveCover}
                className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            JPG, PNG or WebP · up to 8 MB · applies immediately
          </p>
          {coverMsg && (
            <p
              role="status"
              className={`mt-1.5 text-xs font-medium ${
                coverMsg.includes("updated") || coverMsg.includes("removed")
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {coverMsg}
            </p>
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Choose cover photo"
            onChange={onCoverSelected}
          />
        </div>

        <fieldset className="mt-5 border-t border-stone-200 pt-5">
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

      {/* photo position editor — metadata only, image bytes unchanged */}
      {coverEditorOpen && cover && coverKey && (
        <CoverPositionEditor
          src={`${cover}?v=${coverV}`}
          name={displayName}
          initial={coverPos}
          busy={coverBusy}
          message={coverMsg}
          onClose={() => {
            setCoverEditorOpen(false);
            // Conditional mount means Radix focus-restore has no trigger —
            // return keyboard focus to the opening button explicitly.
            requestAnimationFrame(() => adjustCoverBtnRef.current?.focus());
          }}
          onSave={async (next) => {
            setCoverMsg(null);
            setCoverBusy(true);
            try {
              const r = await updateCoverPositionAction({
                focalX: next.focalX,
                focalY: next.focalY,
                zoom: next.zoom,
                expectedCoverPhotoKey: coverKey,
              });
              if (!r.success) setCoverMsg(r.message);
              else {
                setCoverPos(next);
                setCoverEditorOpen(false);
                setCoverMsg("Cover position updated");
              }
            } catch {
              setCoverMsg("Couldn't save position. Try again.");
            } finally {
              setCoverBusy(false);
            }
          }}
        />
      )}
      {editorOpen && photo && photoKey && (
        <PhotoPositionEditor
          src={`${photo}?v=${photoV}`}
          name={displayName}
          initial={pos}
          busy={photoBusy}
          message={posMsg}
          onClose={() => {
            setEditorOpen(false);
            // Conditional mount means Radix focus-restore has no trigger —
            // return keyboard focus to the opening button explicitly.
            requestAnimationFrame(() => adjustBtnRef.current?.focus());
          }}
          onSave={async (next) => {
            setPosMsg(null);
            setPhotoBusy(true);
            try {
              const r = await updatePhotoPositionAction({
                focalX: next.focalX,
                focalY: next.focalY,
                zoom: next.zoom,
                expectedPhotoKey: photoKey,
              });
              if (!r.success) setPosMsg(r.message);
              else {
                setPos(next);
                setEditorOpen(false);
                setPhotoMsg("Photo position updated");
              }
            } catch {
              setPosMsg("Couldn't save position. Try again.");
            } finally {
              setPhotoBusy(false);
            }
          }}
        />
      )}
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
