"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { SPONSOR_PLACEMENTS } from "@/lib/sponsor-placements";
import type { PublicProfileSettingsState } from "./public-profile-settings";

type SponsorSlot = 1 | 2;

/**
 * Sponsor Images — two optional slots in the Career Card Builder.
 * Images upload/remove immediately through the dedicated media routes
 * (same semantics as profile photo and company logo); the optional
 * destination URL is ordinary form state saved by global Save Changes.
 */
export function SponsorImagesSettings({
  form,
  setForm,
  sponsorOneImageUrl,
  sponsorTwoImageUrl,
  onSponsorImageChange,
}: {
  form: PublicProfileSettingsState;
  setForm: React.Dispatch<React.SetStateAction<PublicProfileSettingsState>>;
  sponsorOneImageUrl: string | null;
  sponsorTwoImageUrl: string | null;
  onSponsorImageChange: (slot: SponsorSlot, url: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <SponsorSlotEditor
        slot={1}
        label="Sponsor 1"
        imageUrl={sponsorOneImageUrl}
        urlValue={form.sponsorOneUrl}
        onUrlChange={(v) => setForm((f) => ({ ...f, sponsorOneUrl: v }))}
        placementValue={form.sponsorOnePlacement}
        onPlacementChange={(v) =>
          setForm((f) => ({ ...f, sponsorOnePlacement: v }))
        }
        onImageChange={(url) => onSponsorImageChange(1, url)}
      />
      <SponsorSlotEditor
        slot={2}
        label="Sponsor 2"
        imageUrl={sponsorTwoImageUrl}
        urlValue={form.sponsorTwoUrl}
        onUrlChange={(v) => setForm((f) => ({ ...f, sponsorTwoUrl: v }))}
        placementValue={form.sponsorTwoPlacement}
        onPlacementChange={(v) =>
          setForm((f) => ({ ...f, sponsorTwoPlacement: v }))
        }
        onImageChange={(url) => onSponsorImageChange(2, url)}
      />
      <p className="text-xs leading-relaxed text-stone-400">
        Sponsor images appear in a Sponsored section on your public Career Card.
        Each can link to a website (https only) — leave the link empty to show
        the image without one.
      </p>
    </div>
  );
}

function SponsorSlotEditor({
  slot,
  label,
  imageUrl,
  urlValue,
  onUrlChange,
  placementValue,
  onPlacementChange,
  onImageChange,
}: {
  slot: SponsorSlot;
  label: string;
  imageUrl: string | null;
  urlValue: string;
  onUrlChange: (v: string) => void;
  placementValue: string;
  onPlacementChange: (v: string) => void;
  onImageChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy("upload");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`/api/candidate/public-profile/sponsor/${slot}`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        success?: boolean;
        imageUrl?: string | null;
        message?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.message ?? "Upload failed. Try again.");
        return;
      }
      onImageChange(data.imageUrl ?? null);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setBusy("remove");
    setError(null);
    try {
      const res = await fetch(`/api/candidate/public-profile/sponsor/${slot}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.message ?? "Remove failed. Try again.");
        return;
      }
      onImageChange(null);
    } catch {
      setError("Remove failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {imageUrl && (
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" aria-hidden />
            {busy === "remove" ? "Removing…" : "Remove"}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
          {imageUrl ? (
            // Authorized media URL; object-contain preserves aspect ratio.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${label} preview`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-medium tracking-wide text-stone-400 uppercase">
              No image
            </span>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 disabled:opacity-50"
          >
            {imageUrl ? (
              <RefreshCw className="size-3.5" aria-hidden />
            ) : (
              <ImagePlus className="size-3.5" aria-hidden />
            )}
            {busy === "upload"
              ? "Uploading…"
              : imageUrl
                ? "Replace image"
                : "Upload image"}
          </button>
          <p className="mt-1.5 text-[11px] text-stone-400">
            PNG, JPG, WebP or GIF — up to 8 MB. Aspect ratio preserved.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <label className="mt-3 block">
        <span className="text-xs font-medium text-stone-600">
          Link (optional)
        </span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://"
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-400"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-stone-600">Position</span>
        <select
          value={placementValue}
          onChange={(e) => onPlacementChange(e.target.value)}
          disabled={!imageUrl}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-400 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
        >
          {SPONSOR_PLACEMENTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {!imageUrl && (
          <span className="mt-1 block text-[11px] text-stone-400">
            Upload an image to choose where it appears.
          </span>
        )}
      </label>
    </div>
  );
}
