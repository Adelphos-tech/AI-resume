import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Shared durable image storage on the existing persistent `.data/` volume —
 * covered by the same mount and the same whole-volume backup as resumes.
 * Used by profile photos (`.data/profile-photos`) and cover photos
 * (`.data/cover-photos`).
 */
const DATA_ROOT = path.join(process.cwd(), ".data");

const SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export const IMAGE_INPUT_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
/** Defensive cap against decompression-bomb images. */
const MAX_PIXELS = 40_000_000;

export function newImageKey(): string {
  return `${randomUUID()}.webp`;
}

function storageRoot(dir: string): string {
  return path.join(DATA_ROOT, dir);
}

function resolveImagePath(dir: string, key: string): string {
  const root = storageRoot(dir);
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid image key");
  }
  return resolved;
}

export type ImageValidation =
  { ok: true; buffer: Buffer } | { ok: false; message: string };

/**
 * Byte-level validation + normalization to a single WebP master:
 * EXIF-orient, strip all metadata, fit inside maxW×maxH, never enlarge.
 * `noun` is the user-facing entity name used in error messages.
 */
export async function normalizeImage(
  bytes: Buffer,
  opts: { maxWidth: number; maxHeight: number; noun: string },
): Promise<ImageValidation> {
  if (bytes.byteLength > IMAGE_INPUT_MAX_BYTES) {
    return { ok: false, message: `${opts.noun} is larger than 8 MB.` };
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
      .resize(opts.maxWidth, opts.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    return { ok: true, buffer };
  } catch {
    return {
      ok: false,
      message: `We couldn't process this ${opts.noun.toLowerCase()}.`,
    };
  }
}

async function ensureDir(dir: string) {
  await mkdir(storageRoot(dir), { recursive: true, mode: 0o750 });
}

// Temp write + atomic rename so the key never points at a partial file.
export async function writeImage(
  dir: string,
  key: string,
  bytes: Buffer,
): Promise<void> {
  await ensureDir(dir);
  const finalPath = resolveImagePath(dir, key);
  const tempPath = `${finalPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, bytes, { mode: 0o640 });
    await rename(tempPath, finalPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

export async function readImage(
  dir: string,
  key: string,
): Promise<Buffer | null> {
  try {
    return await readFile(resolveImagePath(dir, key));
  } catch {
    return null;
  }
}

export async function deleteImage(dir: string, key: string): Promise<void> {
  try {
    await rm(resolveImagePath(dir, key), { force: true });
  } catch {
    /* best-effort cleanup */
  }
}
