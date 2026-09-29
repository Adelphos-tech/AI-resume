import "server-only";

import {
  deleteImage,
  newImageKey,
  normalizeImage,
  readImage,
  writeImage,
  type ImageValidation,
} from "@/server/media-store";

/** Cover photos live under `.data/cover-photos` on the shared volume. */
const DIR = "cover-photos";

/** Wide normalized master — aspect ratio preserved, never upscaled. */
const MAX_W = 2400;
const MAX_H = 1200;

export function newCoverKey(): string {
  return newImageKey();
}

export type CoverValidation = ImageValidation;

/**
 * Byte-level validation + normalization to a wide WebP master:
 * EXIF-orient, strip all metadata, fit inside 2400×1200, never enlarge.
 * No forced crop — the frame applies object-fit at render time.
 */
export function normalizeCover(bytes: Buffer): Promise<CoverValidation> {
  return normalizeImage(bytes, {
    maxWidth: MAX_W,
    maxHeight: MAX_H,
    noun: "Cover photo",
  });
}

export function writeCover(key: string, bytes: Buffer): Promise<void> {
  return writeImage(DIR, key, bytes);
}

export function readCover(key: string): Promise<Buffer | null> {
  return readImage(DIR, key);
}

export function deleteCover(key: string): Promise<void> {
  return deleteImage(DIR, key);
}
