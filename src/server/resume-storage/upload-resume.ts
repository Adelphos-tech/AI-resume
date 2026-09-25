import "server-only";

import { createHash } from "node:crypto";
import { Readable } from "node:stream";

import Busboy from "busboy";
import { fileTypeFromBuffer } from "file-type";

import { prisma } from "@/server/db";
import {
  deleteResumeFile,
  newStorageKey,
  writeResumeFile,
} from "@/server/resume-storage/local";

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const MAX_REQUEST_BYTES = 12 * 1024 * 1024;

const DETECTED_TYPES = {
  pdf: { ext: ".pdf", mime: "application/pdf" },
  docx: {
    ext: ".docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
} as const;

export class UploadError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function normalizeFileName(raw: string, detectedExt: "pdf" | "docx") {
  const base = raw
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (!base || base === "." || base === "..") {
    return `resume${DETECTED_TYPES[detectedExt].ext}`;
  }
  return base.length > 120 ? `${base.slice(0, 120)}` : base;
}

// Streams the multipart body through busboy so an oversized request is
// rejected at the byte limit instead of after buffering the whole body.
// Content-Length is only a cheap early rejection; these limits are the
// security boundary.
export function parseResumeUpload(
  request: Request,
): Promise<{ fileName: string; bytes: Buffer }> {
  return new Promise((resolve, reject) => {
    const body = request.body;
    const contentType = request.headers.get("content-type") ?? "";
    if (!body || !contentType.toLowerCase().startsWith("multipart/form-data")) {
      reject(new UploadError(400, "Invalid upload request."));
      return;
    }

    const source = Readable.fromWeb(
      body as import("node:stream/web").ReadableStream,
    );
    const busboy = Busboy({
      headers: { "content-type": contentType },
      limits: {
        fileSize: MAX_RESUME_BYTES,
        files: 1,
        fields: 0,
        parts: 2,
        headerPairs: 50,
      },
      defParamCharset: "utf8",
    });

    const chunks: Buffer[] = [];
    let fileName = "";
    let sawFile = false;
    let totalBytes = 0;
    let settled = false;

    const stop = (error: UploadError | null, value?: never) => {
      if (settled) return;
      settled = true;
      source.destroy();
      if (error) reject(error);
      else resolve({ fileName, bytes: Buffer.concat(chunks) });
      return value;
    };

    busboy.on("file", (name, stream, info) => {
      if (name !== "resume" || sawFile) {
        stream.resume();
        stop(new UploadError(400, "Upload a single PDF or DOCX file."));
        return;
      }
      sawFile = true;
      fileName = info.filename ?? "";
      stream.on("data", (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_RESUME_BYTES) {
          stop(new UploadError(413, "Resume must be 10 MB or smaller."));
        } else {
          chunks.push(chunk);
        }
      });
      stream.on("limit", () =>
        stop(new UploadError(413, "Resume must be 10 MB or smaller.")),
      );
      stream.on("error", () =>
        stop(new UploadError(400, "Invalid upload request.")),
      );
    });

    busboy.on("filesLimit", () =>
      stop(new UploadError(400, "Upload a single PDF or DOCX file.")),
    );
    busboy.on("fieldsLimit", () =>
      stop(new UploadError(400, "Invalid upload request.")),
    );
    busboy.on("partsLimit", () =>
      stop(new UploadError(400, "Invalid upload request.")),
    );
    busboy.on("error", () =>
      stop(new UploadError(400, "Invalid upload request.")),
    );
    source.on("error", () =>
      stop(new UploadError(400, "Invalid upload request.")),
    );

    busboy.on("finish", () => {
      if (!sawFile || totalBytes === 0) {
        stop(new UploadError(400, "Upload a PDF or DOCX file."));
        return;
      }
      stop(null);
    });

    source.pipe(busboy);
  });
}

export type StoredResume = {
  originalFileName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: Date;
};

/**
 * Validates, stores and records an uploaded resume for the given
 * trusted candidateId. Replaces any existing source atomically and
 * invalidates the prior extraction; the previous private file is
 * deleted after a successful swap.
 */
export async function storeCandidateResume(
  candidateId: string,
  upload: { fileName: string; bytes: Buffer },
): Promise<
  { success: true; resume: StoredResume } | { success: false; message: string }
> {
  const bytes = upload.bytes;
  const detected = await fileTypeFromBuffer(bytes);
  const detectedKey =
    detected?.mime === "application/pdf"
      ? "pdf"
      : detected?.mime ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? "docx"
        : null;
  if (!detectedKey) {
    return { success: false, message: "Upload a PDF or DOCX file." };
  }

  const declaredExt = normalizeFileName(upload.fileName, detectedKey)
    .toLowerCase()
    .endsWith(DETECTED_TYPES[detectedKey].ext);
  if (!declaredExt) {
    return { success: false, message: "Upload a PDF or DOCX file." };
  }

  const storageKey = newStorageKey(detectedKey);
  const originalFileName = normalizeFileName(upload.fileName, detectedKey);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  await writeResumeFile(storageKey, bytes);

  const existing = await prisma.candidateResumeSource.findUnique({
    where: { candidateId },
    select: { storageKey: true },
  });

  try {
    const record = await prisma.$transaction(async (tx) => {
      // Replacing the source file invalidates any prior extraction, so the
      // stale text can never remain attached to new source metadata.
      await tx.candidateResumeExtraction.deleteMany({
        where: { resumeSource: { candidateId } },
      });
      return tx.candidateResumeSource.upsert({
        where: { candidateId },
        create: {
          candidateId,
          originalFileName,
          storageKey,
          mimeType: DETECTED_TYPES[detectedKey].mime,
          sizeBytes: bytes.length,
          sha256,
        },
        update: {
          originalFileName,
          storageKey,
          mimeType: DETECTED_TYPES[detectedKey].mime,
          sizeBytes: bytes.length,
          sha256,
          uploadedAt: new Date(),
        },
        select: {
          originalFileName: true,
          sizeBytes: true,
          mimeType: true,
          uploadedAt: true,
        },
      });
    });

    if (existing && existing.storageKey !== storageKey) {
      deleteResumeFile(existing.storageKey).catch(() => {});
    }

    return { success: true, resume: record };
  } catch {
    await deleteResumeFile(storageKey).catch(() => {});
    return {
      success: false,
      message: "Unable to upload resume. Please try again.",
    };
  }
}
