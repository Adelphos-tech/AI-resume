"use client";

import { ImagePlus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
  type PhotoPosition,
} from "@/components/candidate/public-profile/career-card-photo";

export type CareerCardPhotoSettingsProps = {
  displayName: string;
  /* profile photo */
  photoUrl: string | null;
  photoKey: string | null;
  photoPosition: PhotoPosition;
  photoVersion: number;
  photoBusy: boolean;
  photoMessage: string | null;
  /* cover photo */
  coverUrl: string | null;
  coverKey: string | null;
  coverPosition: PhotoPosition;
  coverVersion: number;
  coverBusy: boolean;
  coverMessage: string | null;
  coverWrapClass: string;
  /* refs */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  adjustPhotoBtnRef: React.RefObject<HTMLButtonElement | null>;
  adjustCoverBtnRef: React.RefObject<HTMLButtonElement | null>;
  /* callbacks */
  onPhotoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onCoverFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
  onAdjustPhoto: () => void;
  onAdjustCover: () => void;
};

export function CareerCardPhotoSettings({
  displayName,
  photoUrl,
  photoKey,
  photoPosition,
  photoVersion,
  photoBusy,
  photoMessage,
  coverUrl,
  coverKey,
  coverPosition,
  coverVersion,
  coverBusy,
  coverMessage,
  coverWrapClass,
  fileInputRef,
  coverInputRef,
  adjustPhotoBtnRef,
  adjustCoverBtnRef,
  onPhotoFileSelect,
  onRemovePhoto,
  onCoverFileSelect,
  onRemoveCover,
  onAdjustPhoto,
  onAdjustCover,
}: CareerCardPhotoSettingsProps) {
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile photo */}
      <div>
        <p className="text-sm font-semibold text-stone-900">Profile photo</p>
        <p className="mt-0.5 text-sm text-stone-500">
          Add a professional photo to personalize your Career Card.
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {photoUrl ? (
              <CareerCardProfilePhoto
                key={photoVersion}
                src={`${photoUrl}?v=${photoVersion}`}
                alt={`${displayName} profile photo`}
                position={photoPosition}
                frameClassName="size-20 rounded-full ring-4 ring-emerald-50"
              />
            ) : (
              <div
                aria-hidden
                className="grid size-20 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white ring-4 ring-emerald-50"
              >
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={photoBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-3.5" aria-hidden />
                {photoBusy
                  ? "Uploading…"
                  : photoUrl
                    ? "Replace photo"
                    : "Upload photo"}
              </Button>
              {photoUrl && photoKey && (
                <Button
                  ref={adjustPhotoBtnRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={photoBusy}
                  onClick={onAdjustPhoto}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Adjust photo
                </Button>
              )}
              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={photoBusy}
                  onClick={onRemovePhoto}
                  className="text-stone-600 hover:text-red-700"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remove
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">
              JPG, PNG or WebP · up to 8 MB · applies immediately
            </p>
            {photoMessage && (
              <p
                role="status"
                className={`mt-1.5 text-xs font-medium ${
                  photoMessage.includes("updated") ||
                  photoMessage.includes("removed")
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {photoMessage}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Choose profile photo"
            onChange={onPhotoFileSelect}
          />
        </div>
      </div>

      {/* Cover photo */}
      <div className="border-t border-stone-100 pt-6">
        <p className="text-sm font-semibold text-stone-900">Cover photo</p>
        <p className="mt-0.5 text-sm text-stone-500">
          Add a wide image to personalize your Career Card header.
        </p>
        <div className="mt-3">
          {coverUrl ? (
            <div className="rounded-xl border border-stone-200 bg-stone-100">
              <CareerCardCoverPhoto
                src={`${coverUrl}${coverUrl.includes("?") ? "&" : "?"}v=${coverVersion}`}
                alt=""
                position={coverPosition}
                frameClassName={`${coverWrapClass} rounded-xl`}
              />
            </div>
          ) : (
            <div className="grid aspect-2/1 w-full place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400">
              <span className="flex items-center gap-2">
                <ImagePlus className="size-4" aria-hidden />
                Add a cover photo
              </span>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={coverBusy}
              onClick={() => coverInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" aria-hidden />
              {coverBusy
                ? "Uploading…"
                : coverUrl
                  ? "Replace cover"
                  : "Upload cover"}
            </Button>
            {coverUrl && coverKey && (
              <Button
                ref={adjustCoverBtnRef}
                type="button"
                variant="outline"
                size="sm"
                disabled={coverBusy}
                onClick={onAdjustCover}
              >
                <Pencil className="size-3.5" aria-hidden />
                Adjust cover
              </Button>
            )}
            {coverUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={coverBusy}
                onClick={onRemoveCover}
                className="text-stone-600 hover:text-red-700"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            JPG, PNG or WebP · up to 8 MB · applies immediately
          </p>
          {coverMessage && (
            <p
              role="status"
              className={`mt-1.5 text-xs font-medium ${
                coverMessage.includes("updated") ||
                coverMessage.includes("removed")
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {coverMessage}
            </p>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Choose cover photo"
            onChange={onCoverFileSelect}
          />
        </div>
      </div>
    </div>
  );
}
