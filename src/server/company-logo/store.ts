import "server-only";

import {
  deleteImage,
  newImageKey,
  normalizeImage,
  readImage,
  writeImage,
  type ImageValidation,
} from "@/server/media-store";

/** Company logos live under `.data/company-logos` on the shared volume. */
const DIR = "company-logos";

/** Normalized master bound — aspect ratio preserved, never upscaled. */
const MASTER_DIM = 1200;

export function newLogoKey(): string {
  return newImageKey();
}

export type LogoValidation = ImageValidation;

/**
 * Byte-level validation + normalization to a single WebP master:
 * EXIF-orient, strip all metadata, fit inside 1200², never enlarge.
 */
export function normalizeLogo(bytes: Buffer): Promise<LogoValidation> {
  return normalizeImage(bytes, {
    maxWidth: MASTER_DIM,
    maxHeight: MASTER_DIM,
    noun: "Logo",
  });
}

export function writeLogo(key: string, bytes: Buffer): Promise<void> {
  return writeImage(DIR, key, bytes);
}

export function readLogo(key: string): Promise<Buffer | null> {
  return readImage(DIR, key);
}

export function deleteLogo(key: string): Promise<void> {
  return deleteImage(DIR, key);
}
