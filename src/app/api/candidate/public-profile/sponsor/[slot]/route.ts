import { NextResponse } from "next/server";

import {
  parseSponsorSlot,
  removeSponsorImage,
  saveSponsorImage,
} from "@/server/public-profile/sponsor";
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
 * Sponsor-image upload — dedicated route handler so valid ≤8 MB images
 * are not blocked by the 1 MB Server Action body cap. Session-authenticated;
 * ownership and slot derive from the session and path, never request data.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slot: string }> },
) {
  const { slot: rawSlot } = await params;
  const slot = parseSponsorSlot(rawSlot);
  if (!slot) return fail(404, "Not found.");

  const context = await getCandidateSession();
  if (!context) {
    return fail(401, "Unauthorized.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PHOTO_REQUEST_BYTES) {
    return fail(413, "Sponsor image is larger than 8 MB.");
  }

  let bytes: Buffer;
  try {
    bytes = await parseMultipartImage(request, {
      field: "image",
      noun: "Sponsor image",
    });
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      return fail(error.status, error.message);
    }
    return fail(400, "Upload failed. Try again.");
  }

  const result = await saveSponsorImage(context.candidate.id, slot, bytes);
  if (!result.success) {
    return fail(
      result.message === "Upload failed. Try again." ? 500 : 422,
      result.message,
    );
  }
  return NextResponse.json(result);
}

/** Removes the slot's image (and its optional URL) — session-owned only. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slot: string }> },
) {
  const { slot: rawSlot } = await params;
  const slot = parseSponsorSlot(rawSlot);
  if (!slot) return fail(404, "Not found.");

  const context = await getCandidateSession();
  if (!context) {
    return fail(401, "Unauthorized.");
  }

  const result = await removeSponsorImage(context.candidate.id, slot);
  if (!result.success) {
    return fail(500, "Remove failed. Try again.");
  }
  return NextResponse.json(result);
}
