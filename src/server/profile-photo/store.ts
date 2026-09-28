import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Profile-photo storage. Shares the existing persistent `.data/` volume —
 * covered by the same mount and the same whole-volume backup as resumes.
 */
const PHOTO_STORAGE_ROOT = path.join(process.cwd(), ".data", "profile-photos");

export const MAX_PHOTO_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB
/** Defensive cap against decompression-bomb images. */
const MAX_PIXELS = 40_000_000;
/** Normalized master bound — aspect ratio preserved, never upscaled. */
const MASTER_DIM = 1600;

const SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export function newPhotoKey(): string {
  return `${randomUUID()}.webp`;
}

function resolvePhotoPath(key: string): string {
  const resolved = path.resolve(PHOTO_STORAGE_ROOT, key);
  if (!resolved.startsWith(PHOTO_STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid photo key");
  }
  return resolved;
}

export type PhotoValidation =
  { ok: true; buffer: Buffer } | { ok: false; message: string };

/**
 * Byte-level validation + normalization to a single WebP master:
 * EXIF-orient, strip all metadata, fit inside 1600², never enlarge.
 */
export async function normalizePhoto(bytes: Buffer): Promise<PhotoValidation> {
  if (bytes.byteLength > MAX_PHOTO_INPUT_BYTES) {
    return { ok: false, message: "Photo is larger than 8 MB." };
  }
  // Sniff the real bytes — extension and Content-Type are not trusted.
  const { fileTypeFromBuffer } = await import("file-type");
  const type = await fileTypeFromBuffer(bytes);
  if (!type || !SUPPORTED_MIME.has(type.mime)) {
    return { ok: false, message: "Unsupported image format." };
  }
  try {
    const buffer = await sharp(bytes, { limitInputPixels: MAX_PIXELS })
      .rotate() // EXIF auto-orient, then metadata is stripped on encode
      .resize(MASTER_DIM, MASTER_DIM, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    return { ok: true, buffer };
  } catch {
    return { ok: false, message: "We couldn't process this photo." };
  }
}

async function ensureDir() {
  await mkdir(PHOTO_STORAGE_ROOT, { recursive: true, mode: 0o750 });
}

// Temp write + atomic rename so the key never points at a partial file.
export async function writePhoto(key: string, bytes: Buffer): Promise<void> {
  await ensureDir();
  const finalPath = resolvePhotoPath(key);
  const tempPath = `${finalPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, bytes, { mode: 0o640 });
    await rename(tempPath, finalPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

export async function readPhoto(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolvePhotoPath(key));
  } catch {
    return null;
  }
}

export async function deletePhoto(key: string): Promise<void> {
  try {
    await rm(resolvePhotoPath(key), { force: true });
  } catch {
    /* best-effort cleanup */
  }
}
