import { createHash } from "node:crypto";
import { Readable } from "node:stream";

import Busboy from "busboy";
import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";

import { resolveCandidateIntakeToken } from "@/server/candidates/intake-access";
import { prisma } from "@/server/db";
import {
  deleteResumeFile,
  newStorageKey,
  writeResumeFile,
} from "@/server/resume-storage/local";

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = 12 * 1024 * 1024;

const DETECTED_TYPES = {
  pdf: { ext: ".pdf", mime: "application/pdf" },
  docx: {
    ext: ".docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
} as const;

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

class UploadError extends Error {
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
function parseResumeUpload(
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

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return fail(401, "Unauthorized.");
  }

  const resolved = await resolveCandidateIntakeToken(token);
  if (!resolved) {
    return fail(401, "This intake link is no longer available.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return fail(413, "Resume must be 10 MB or smaller.");
  }

  let upload: { fileName: string; bytes: Buffer };
  try {
    upload = await parseResumeUpload(request);
  } catch (error) {
    if (error instanceof UploadError) {
      return fail(error.status, error.message);
    }
    return fail(400, "Invalid upload request.");
  }

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
    return fail(422, "Upload a PDF or DOCX file.");
  }

  const declaredExt = normalizeFileName(upload.fileName, detectedKey)
    .toLowerCase()
    .endsWith(DETECTED_TYPES[detectedKey].ext);
  if (!declaredExt) {
    return fail(422, "Upload a PDF or DOCX file.");
  }

  const storageKey = newStorageKey(detectedKey);
  const originalFileName = normalizeFileName(upload.fileName, detectedKey);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  await writeResumeFile(storageKey, bytes);

  const existing = await prisma.candidateResumeSource.findUnique({
    where: { candidateId: resolved.candidateId },
    select: { storageKey: true },
  });

  try {
    const record = await prisma.candidateResumeSource.upsert({
      where: { candidateId: resolved.candidateId },
      create: {
        candidateId: resolved.candidateId,
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

    if (existing && existing.storageKey !== storageKey) {
      deleteResumeFile(existing.storageKey).catch(() => {});
    }

    return NextResponse.json({ success: true, resume: record });
  } catch {
    await deleteResumeFile(storageKey).catch(() => {});
    return fail(500, "Unable to upload resume. Please try again.");
  }
}
