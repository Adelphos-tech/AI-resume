import "server-only";

import { Readable } from "node:stream";

import Busboy from "busboy";

/** Hard file limit — the product contract is exactly 8 MB. */
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
/** Request ceiling: file limit + multipart framing margin. */
export const MAX_PHOTO_REQUEST_BYTES = MAX_PHOTO_BYTES + 512 * 1024;

export class PhotoUploadError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Streams the multipart body through busboy so an oversized upload is
 * rejected at the byte limit instead of after buffering the whole body.
 * Mirrors the proven resume-upload parser; Content-Length is only a cheap
 * early rejection — these limits are the security boundary.
 */
export function parsePhotoUpload(request: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = request.body;
    const contentType = request.headers.get("content-type") ?? "";
    if (!body || !contentType.toLowerCase().startsWith("multipart/form-data")) {
      reject(new PhotoUploadError(400, "Upload a photo file."));
      return;
    }

    const source = Readable.fromWeb(
      body as import("node:stream/web").ReadableStream,
    );
    const busboy = Busboy({
      headers: { "content-type": contentType },
      limits: {
        fileSize: MAX_PHOTO_BYTES,
        files: 1,
        fields: 0,
        parts: 2,
        headerPairs: 50,
      },
      defParamCharset: "utf8",
    });

    const chunks: Buffer[] = [];
    let sawFile = false;
    let totalBytes = 0;
    let settled = false;

    const stop = (error: PhotoUploadError | null) => {
      if (settled) return;
      settled = true;
      source.destroy();
      if (error) reject(error);
      else resolve(Buffer.concat(chunks));
    };

    busboy.on("file", (name, stream) => {
      if (name !== "photo" || sawFile) {
        stream.resume();
        stop(new PhotoUploadError(400, "Upload a single photo file."));
        return;
      }
      sawFile = true;
      stream.on("data", (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_PHOTO_BYTES) {
          stop(new PhotoUploadError(413, "Photo is larger than 8 MB."));
        } else {
          chunks.push(chunk);
        }
      });
      stream.on("limit", () =>
        stop(new PhotoUploadError(413, "Photo is larger than 8 MB.")),
      );
      stream.on("error", () =>
        stop(new PhotoUploadError(400, "Upload failed. Try again.")),
      );
    });

    busboy.on("filesLimit", () =>
      stop(new PhotoUploadError(400, "Upload a single photo file.")),
    );
    busboy.on("fieldsLimit", () =>
      stop(new PhotoUploadError(400, "Upload failed. Try again.")),
    );
    busboy.on("partsLimit", () =>
      stop(new PhotoUploadError(400, "Upload failed. Try again.")),
    );
    busboy.on("error", () =>
      stop(new PhotoUploadError(400, "Upload failed. Try again.")),
    );
    source.on("error", () =>
      stop(new PhotoUploadError(400, "Upload failed. Try again.")),
    );

    busboy.on("finish", () => {
      if (!sawFile || totalBytes === 0) {
        stop(new PhotoUploadError(400, "Upload a photo file."));
        return;
      }
      stop(null);
    });

    source.pipe(busboy);
  });
}
