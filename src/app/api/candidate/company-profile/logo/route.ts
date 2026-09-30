import { NextResponse } from "next/server";

import { saveCompanyLogo } from "@/server/public-profile/company-profile";
import {
  MAX_PHOTO_REQUEST_BYTES,
  parseMultipartImage,
  PhotoUploadError,
} from "@/server/profile-photo/upload";
import { getCandidateSession } from "@/server/session";

export const runtime = "nodejs";

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Company-logo upload — dedicated route handler so valid ≤8 MB logos are
 * not blocked by the 1 MB Server Action body cap. Session-authenticated;
 * ownership derives from the candidate session, never from request data.
 */
export async function POST(request: Request) {
  const context = await getCandidateSession();
  if (!context) {
    return fail(401, "Unauthorized.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PHOTO_REQUEST_BYTES) {
    return fail(413, "Logo is larger than 8 MB.");
  }

  let bytes: Buffer;
  try {
    bytes = await parseMultipartImage(request, { field: "logo", noun: "Logo" });
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      return fail(error.status, error.message);
    }
    return fail(400, "Upload failed. Try again.");
  }

  const result = await saveCompanyLogo(context.candidate.id, bytes);
  if (!result.success) {
    return fail(
      result.message === "Upload failed. Try again." ? 500 : 422,
      result.message,
    );
  }
  return NextResponse.json(result);
}
