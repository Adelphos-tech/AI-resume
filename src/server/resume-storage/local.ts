import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const RESUME_STORAGE_ROOT = path.join(process.cwd(), ".data", "resumes");

export const RESUME_STORAGE_DIRNAME = ".data/resumes";

export function newStorageKey(extension: "pdf" | "docx") {
  return `${randomUUID()}.${extension}`;
}

function resolveStoragePath(storageKey: string): string {
  const resolved = path.resolve(RESUME_STORAGE_ROOT, storageKey);
  if (!resolved.startsWith(RESUME_STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

export async function ensureStorageDir() {
  await mkdir(RESUME_STORAGE_ROOT, { recursive: true, mode: 0o750 });
}

// Writes to a random temp name then atomically renames so the final
// storage key never points at a partially written file.
export async function writeResumeFile(
  storageKey: string,
  bytes: Buffer,
): Promise<void> {
  await ensureStorageDir();
  const finalPath = resolveStoragePath(storageKey);
  const tempPath = `${finalPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, bytes, { mode: 0o640 });
    await rename(tempPath, finalPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

export async function readResumeFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveStoragePath(storageKey));
}

export async function deleteResumeFile(storageKey: string): Promise<void> {
  await rm(resolveStoragePath(storageKey), { force: true });
}
