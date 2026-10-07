"use client";

import { Check, Copy, ExternalLink, Globe, Link2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { type CareerCardThemeId } from "@/lib/career-card-themes";
import { type CareerCardAccentColorId } from "@/lib/career-card-accent-colors";
import { type CareerCardStyleId } from "@/lib/career-card-styles";
import { cardStyleTokens } from "@/lib/career-card-theme-styles";

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
  CoverPositionEditor,
  DEFAULT_PHOTO_POSITION,
  PhotoPositionEditor,
  type PhotoPosition,
} from "@/components/candidate/public-profile/career-card-photo";
import type { ThemeRecommendation } from "@/lib/career-card-themes";
import { type NfcCompactSkinId } from "@/lib/nfc-compact-skins";
import { CareerCardNfcWriter } from "@/components/candidate/public-profile/career-card-nfc-writer";
import { Button } from "@/components/ui/button";
import type { BuilderStep } from "@/components/candidate/public-profile/career-card-builder";
import { CareerCardIdentitySettings } from "@/components/candidate/public-profile/career-card-identity-settings";
import { CareerCardPhotoSettings } from "@/components/candidate/public-profile/career-card-photo-settings";
import { CareerCardDesignSettings } from "@/components/candidate/public-profile/career-card-design-settings";
import { CareerCardLinksSettings } from "@/components/candidate/public-profile/career-card-links-settings";

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
  whatsappNumber: string;
  whatsappCountry: string;
  showWhatsapp: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showCertifications: boolean;
  showLanguages: boolean;
  featuredResumeVariantId: string;
  themeId: CareerCardThemeId;
  accentColorId: CareerCardAccentColorId;
  cardStyleId: CareerCardStyleId;
  nfcCompactSkinId: NfcCompactSkinId;
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
  activeStep,
  formState,
  onFormChange,
  onPhotoUrlChange,
  onCoverUrlChange,
  onPhotoPositionChange,
  onCoverPositionChange,
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
  activeStep: BuilderStep;
  /** Optional controlled form state for shared preview editing. */
  formState?: PublicProfileSettingsState;
  /** Optional controlled form setter for shared preview editing. */
  onFormChange?: React.Dispatch<
    React.SetStateAction<PublicProfileSettingsState>
  >;
  /** Optional callback when a profile-photo upload or remove changes the
   * server-backed photo URL. */
  onPhotoUrlChange?: (url: string | null) => void;
  /** Optional callback when a cover-photo upload or remove changes the
   * server-backed cover URL. */
  onCoverUrlChange?: (url: string | null) => void;
  /** Optional callback when a profile-photo position/zoom is saved. */
  onPhotoPositionChange?: (pos: PhotoPosition) => void;
  /** Optional callback when a cover-photo position/zoom is saved. */
  onCoverPositionChange?: (pos: PhotoPosition) => void;
}) {
  const [slugValue, setSlugValue] = useState(slug ?? "");
  const [internalForm, setInternalForm] = useState<PublicProfileSettingsState>(
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
      whatsappNumber: "",
      whatsappCountry: "",
      showWhatsapp: false,
      showExperience: false,
      showEducation: false,
      showSkills: false,
      showProjects: false,
      showCertifications: false,
      showLanguages: false,
      featuredResumeVariantId: "",
      themeId: "role-race-classic",
      accentColorId: "emerald",
      cardStyleId: "standard",
      nfcCompactSkinId: "career-passport",
    },
  );
  const form = formState ?? internalForm;
  const setForm = onFormChange ?? setInternalForm;
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

  const themeTokens = cardStyleTokens(
    form.themeId,
    form.accentColorId,
    form.cardStyleId,
  );
  const coverWrapClass =
    themeTokens.premium?.coverWrap ?? themeTokens.base.coverWrap;

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
        const nextUrl = r.photoUrl ?? null;
        setPhoto(nextUrl);
        setPhotoKey(r.photoKey ?? null);
        setPos(DEFAULT_PHOTO_POSITION); // new photo → centered presentation
        setPhotoV((v) => v + 1); // refresh the preview even at the same URL
        setPhotoMsg("Profile photo updated");
        onPhotoUrlChange?.(nextUrl);
        onPhotoPositionChange?.(DEFAULT_PHOTO_POSITION);
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
        onPhotoUrlChange?.(null);
        onPhotoPositionChange?.(DEFAULT_PHOTO_POSITION);
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
        const nextUrl = r.coverUrl ?? null;
        setCover(nextUrl);
        setCoverKey(r.coverKey ?? null);
        setCoverV((v) => v + 1); // refresh the preview even at the same URL
        setCoverPos(DEFAULT_PHOTO_POSITION); // new cover → centered framing
        setCoverMsg("Cover photo updated");
        onCoverUrlChange?.(nextUrl);
        onCoverPositionChange?.(DEFAULT_PHOTO_POSITION);
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
        onCoverUrlChange?.(null);
        onCoverPositionChange?.(DEFAULT_PHOTO_POSITION);
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
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
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

      {/* photos */}
      <section
        aria-labelledby="pp-photos"
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
      >
        <h2 id="pp-photos" className="text-base font-semibold text-stone-900">
          Photos
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Personalize how your Career Card looks.
        </p>
        <div className="mt-5">
          <CareerCardPhotoSettings
            displayName={displayName}
            photoUrl={photo}
            photoKey={photoKey}
            photoPosition={pos}
            photoVersion={photoV}
            photoBusy={photoBusy}
            photoMessage={photoMsg}
            coverUrl={cover}
            coverKey={coverKey}
            coverPosition={coverPos}
            coverVersion={coverV}
            coverBusy={coverBusy}
            coverMessage={coverMsg}
            coverWrapClass={coverWrapClass}
            fileInputRef={fileRef}
            coverInputRef={coverRef}
            adjustPhotoBtnRef={adjustBtnRef}
            adjustCoverBtnRef={adjustCoverBtnRef}
            onPhotoFileSelect={onPhotoSelected}
            onRemovePhoto={onRemovePhoto}
            onCoverFileSelect={onCoverSelected}
            onRemoveCover={onRemoveCover}
            onAdjustPhoto={() => {
              setPosMsg(null);
              setEditorOpen(true);
            }}
            onAdjustCover={() => {
              setCoverMsg(null);
              setCoverEditorOpen(true);
            }}
          />
        </div>
      </section>

      {/* theme selector */}
      <section
        aria-labelledby="pp-appearance"
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "design" ? "block" : "hidden"}`}
      >
        <h2
          id="pp-appearance"
          className="text-base font-semibold text-stone-900"
        >
          Career Card Appearance
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Choose how your public Career Card looks. Changes apply after Save
          profile — your link and data stay the same.
        </p>
        <div className="mt-5">
          <CareerCardDesignSettings
            form={form}
            setForm={setForm}
            reco={reco}
            setReco={setReco}
            recoBusy={recoBusy}
            setRecoBusy={setRecoBusy}
            recoErr={recoErr}
            setRecoErr={setRecoErr}
          />
        </div>
      </section>

      {/* identity */}
      <section
        aria-labelledby="pp-identity"
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
      >
        <h2 id="pp-identity" className="text-base font-semibold text-stone-900">
          Identity
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          How you appear on your Career Card.
        </p>
        <div className="mt-5">
          <CareerCardIdentitySettings form={form} setForm={setForm} />
        </div>
      </section>

      {/* visibility */}
      <section
        aria-labelledby="pp-visibility"
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
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
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
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
        className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
      >
        <h2 id="pp-links" className="text-base font-semibold text-stone-900">
          Links &amp; Contact
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Help people connect with you.
        </p>
        <div className="mt-5">
          <CareerCardLinksSettings form={form} setForm={setForm} />
        </div>
      </section>

      {/* save */}
      <div
        className={`flex items-center gap-3 ${activeStep === "basics" ? "" : "hidden"}`}
      >
        <Button
          type="button"
          onClick={() =>
            run(
              () =>
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
                  whatsappNumber: form.whatsappNumber,
                  whatsappCountry: form.whatsappCountry,
                  showWhatsapp: form.showWhatsapp,
                  showExperience: form.showExperience,
                  showEducation: form.showEducation,
                  showSkills: form.showSkills,
                  showProjects: form.showProjects,
                  showCertifications: form.showCertifications,
                  showLanguages: form.showLanguages,
                  featuredResumeVariantId: form.featuredResumeVariantId || null,
                  themeId: form.themeId,
                  accentColorId: form.accentColorId,
                  cardStyleId: form.cardStyleId,
                  nfcCompactSkinId: form.nfcCompactSkinId,
                }),
              true,
            )
          }
          disabled={isPending}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          {isPending ? "Saving…" : "Save Career Card settings"}
        </Button>
        {saved && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            Saved
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* permanent card link */}
      {shareUrl && (
        <section
          aria-labelledby="pp-card-link"
          className={`rounded-2xl border border-stone-200 bg-white p-6 ${activeStep === "basics" ? "block" : "hidden"}`}
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
      {shareUrl && (
        <div className={activeStep === "basics" ? "block" : "hidden"}>
          <CareerCardNfcWriter careerCardUrl={shareUrl} />
        </div>
      )}

      {/* photo position editor — metadata only, image bytes unchanged */}
      {coverEditorOpen && cover && coverKey && (
        <CoverPositionEditor
          src={`${cover}?v=${coverV}`}
          name={displayName}
          initial={coverPos}
          busy={coverBusy}
          message={coverMsg}
          frameClassName={coverWrapClass}
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
                onCoverPositionChange?.(next);
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
                onPhotoPositionChange?.(next);
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
