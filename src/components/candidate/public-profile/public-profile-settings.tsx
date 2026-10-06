"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  LayoutPanelTop,
  Link2,
  Palette,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import {
  CAREER_CARD_THEMES,
  type CareerCardThemeId,
} from "@/lib/career-card-themes";
import {
  CAREER_CARD_ACCENT_COLORS,
  type CareerCardAccentColorId,
} from "@/lib/career-card-accent-colors";
import { WhatsappCountrySelect } from "@/components/candidate/public-profile/whatsapp-fields";
import {
  CAREER_CARD_STYLES,
  type CareerCardStyleId,
} from "@/lib/career-card-styles";
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
import {
  NFC_COMPACT_SKINS,
  type NfcCompactSkinId,
} from "@/lib/nfc-compact-skins";
import { CareerCardNfcWriter } from "@/components/candidate/public-profile/career-card-nfc-writer";
import { Button } from "@/components/ui/button";
import { CareerCardBuilderSection } from "@/components/candidate/public-profile/career-card-builder-section";
import type { BuilderStep } from "@/components/candidate/public-profile/career-card-builder";
import { CareerCardIdentitySettings } from "@/components/candidate/public-profile/career-card-identity-settings";
import { CareerCardPhotoSettings } from "@/components/candidate/public-profile/career-card-photo-settings";

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

/** Lightweight skin preview chips — CSS only, no image generation. */
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
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-[#fafaf9] ring-1 ring-stone-200">
      <span className="absolute inset-y-0 left-0 w-1 bg-emerald-700" />
      <span className="absolute top-2 left-4 h-2 w-8 rounded-full bg-stone-800" />
      <span className="absolute top-5 left-4 h-1.5 w-14 rounded-full bg-emerald-700/60" />
      <span className="absolute right-2 bottom-2 h-5 w-14 rounded-md bg-emerald-700" />
    </div>
  );
}

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
          className="flex items-center gap-2 text-base font-semibold text-stone-900"
        >
          <Palette className="size-4 text-emerald-700" aria-hidden />
          Career Card Appearance
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          Choose how your public Career Card looks. Changes apply after Save
          profile — your link and data stay the same.
        </p>

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
            className="grid gap-2 sm:grid-cols-3"
          >
            {CAREER_CARD_ACCENT_COLORS.map((a) => {
              const selected = form.accentColorId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    setForm((f) => ({ ...f, accentColorId: a.id }))
                  }
                  className={`group flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-6 shrink-0 rounded-full ${a.swatchClass}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-stone-900">
                      {a.label}
                    </span>
                    <span className="block truncate text-xs text-stone-500">
                      {a.description}
                    </span>
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
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ── Card style ── */}
        <fieldset className="mt-6">
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
                  className={`group flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
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
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-stone-900">
                      {s.label}
                    </span>
                    <span className="block text-xs leading-snug text-stone-500">
                      {s.description}
                    </span>
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
                </button>
              );
            })}
          </div>
        </fieldset>
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
          <div>
            <label htmlFor="pp-whatsapp" className={labelCls}>
              WhatsApp
            </label>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-[190px_minmax(0,1fr)]">
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
            <div className="mt-2 flex items-center gap-2.5">
              <button
                id="pp-show-whatsapp"
                type="button"
                role="switch"
                aria-checked={form.showWhatsapp}
                aria-label="Show WhatsApp on Career Card"
                onClick={() =>
                  setForm((f) => ({ ...f, showWhatsapp: !f.showWhatsapp }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
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
              <label
                htmlFor="pp-show-whatsapp"
                className="text-sm font-medium text-stone-800"
              >
                Show WhatsApp publicly
              </label>
            </div>
            {form.whatsappNumber.trim() ? (
              <p className="mt-1.5 text-xs text-stone-500">
                {form.showWhatsapp
                  ? "Shown publicly."
                  : "Saved privately — not shown publicly."}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-stone-500">
                Pick the country, then enter your normal national number.
              </p>
            )}
          </div>
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

      {/* preview */}
      {activeStep === "preview" && (
        <CareerCardBuilderSection
          title="Preview"
          description="Review how your Career Card looks to others."
        >
          <p className="text-sm text-stone-500">
            Your live preview is shown in the panel
            <span className="hidden lg:inline"> to the right</span>
            <span className="lg:hidden"> above</span>.
          </p>
        </CareerCardBuilderSection>
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
