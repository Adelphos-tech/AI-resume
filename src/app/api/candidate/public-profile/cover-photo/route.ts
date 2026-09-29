import { NextResponse } from "next/server";

import { saveCoverPhoto } from "@/server/public-profile/cover";
import {
  MAX_COVER_REQUEST_BYTES,
  parseMultipartImage,
  PhotoUploadError,
} from "@/server/profile-photo/upload";
import { getCandidateSession } from "@/server/session";

export const runtime = "nodejs";

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Cover-photo upload — dedicated route handler (not a Server Action) so
 * the framework's 1 MB server-action body limit doesn't block valid ≤8 MB
 * images. Session-authenticated; ownership derives from the candidate
 * session, never from request data.
 */
export async function POST(request: Request) {
  const context = await getCandidateSession();
  if (!context) {
    return fail(401, "Unauthorized.");
  }

  // Cheap early rejection; busboy limits are the real boundary.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_COVER_REQUEST_BYTES) {
    return fail(413, "Cover photo is larger than 8 MB.");
  }

  let bytes: Buffer;
  try {
    bytes = await parseMultipartImage(request, {
      field: "cover",
      noun: "Cover photo",
    });
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      return fail(error.status, error.message);
    }
    return fail(400, "Upload failed. Try again.");
  }

  const result = await saveCoverPhoto(context.candidate.id, bytes);
  if (!result.success) {
    return fail(
      result.message === "Upload failed. Try again." ? 500 : 422,
      result.message,
    );
  }
  return NextResponse.json({
    success: true,
    coverUrl: result.coverUrl,
    coverKey: result.coverKey,
  });
}
