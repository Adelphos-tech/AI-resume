import "server-only";

import {
  deleteImage,
  newImageKey,
  normalizeImage,
  readImage,
  writeImage,
  type ImageValidation,
} from "@/server/media-store";

/** Profile photos live under `.data/profile-photos` on the shared volume. */
const DIR = "profile-photos";

/** Normalized master bound — aspect ratio preserved, never upscaled. */
const MASTER_DIM = 1600;

export function newPhotoKey(): string {
  return newImageKey();
}

export type PhotoValidation = ImageValidation;

/**
 * Byte-level validation + normalization to a single WebP master:
 * EXIF-orient, strip all metadata, fit inside 1600², never enlarge.
 */
export function normalizePhoto(bytes: Buffer): Promise<PhotoValidation> {
  return normalizeImage(bytes, {
    maxWidth: MASTER_DIM,
    maxHeight: MASTER_DIM,
    noun: "Photo",
  });
}

export function writePhoto(key: string, bytes: Buffer): Promise<void> {
  return writeImage(DIR, key, bytes);
}

export function readPhoto(key: string): Promise<Buffer | null> {
  return readImage(DIR, key);
}

export function deletePhoto(key: string): Promise<void> {
  return deleteImage(DIR, key);
}
