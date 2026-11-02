import "server-only";

import {
  deleteImage,
  newImageKey,
  normalizeImage,
  readImage,
  writeImage,
  type ImageValidation,
} from "@/server/media-store";

/** Sponsor images live under `.data/sponsors` on the shared volume. */
const DIR = "sponsors";

/** Normalized master bound — aspect ratio preserved, never upscaled. */
const MASTER_DIM = 1200;

export function newSponsorImageKey(): string {
  return newImageKey();
}

export type SponsorImageValidation = ImageValidation;

/**
 * Byte-level validation + normalization to a single WebP master:
 * EXIF-orient, strip all metadata, fit inside 1200², never enlarge.
 * Identical guarantees to profile photos and company logos.
 */
export function normalizeSponsorImage(
  bytes: Buffer,
): Promise<SponsorImageValidation> {
  return normalizeImage(bytes, {
    maxWidth: MASTER_DIM,
    maxHeight: MASTER_DIM,
    noun: "Sponsor image",
  });
}

export function writeSponsorImage(key: string, bytes: Buffer): Promise<void> {
  return writeImage(DIR, key, bytes);
}

export function readSponsorImage(key: string): Promise<Buffer | null> {
  return readImage(DIR, key);
}

export function deleteSponsorImage(key: string): Promise<void> {
  return deleteImage(DIR, key);
}
