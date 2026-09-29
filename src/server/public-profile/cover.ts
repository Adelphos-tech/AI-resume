import "server-only";

import { z } from "zod";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";
import {
  deleteCover,
  newCoverKey,
  normalizeCover,
  writeCover,
} from "@/server/cover-photo/store";

export type CoverActionResult =
  | { success: true; coverUrl: string | null; coverKey: string | null }
  | { success: false; message: string };

/**
 * Cover-photo pipeline — same safe ordering as profile photos:
 * validate → normalize → write new → persist key → delete old.
 * On persistence failure the new orphan is removed and the old cover stays.
 * Ownership comes from the authenticated candidate session — never from a
 * client-supplied candidateId/profileId/key.
 */
export async function saveCoverPhoto(
  candidateId: string,
  bytes: Buffer,
): Promise<CoverActionResult> {
  const normalized = await normalizeCover(bytes);
  if (!normalized.ok) return { success: false, message: normalized.message };

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: { id: true, slug: true, coverPhotoKey: true },
  });
  if (!profile) {
    return { success: false, message: "Create your Career Card first." };
  }

  const newKey = newCoverKey();
  try {
    await writeCover(newKey, normalized.buffer);
  } catch {
    return { success: false, message: "Upload failed. Try again." };
  }

  try {
    await prisma.publicProfile.update({
      where: { id: profile.id },
      data: {
        coverPhotoKey: newKey,
        // New image → fresh centered framing; never inherit the old crop.
        coverPhotoFocalX: 0.5,
        coverPhotoFocalY: 0.5,
        coverPhotoZoom: 1.0,
      },
    });
  } catch {
    await deleteCover(newKey); // drop the orphan — old cover stays intact
    return { success: false, message: "Upload failed. Try again." };
  }

  if (profile.coverPhotoKey) await deleteCover(profile.coverPhotoKey);
  return {
    success: true,
    coverUrl: `/u/${profile.slug}/cover`,
    coverKey: newKey,
  };
}

/** Clears the cover key first, then removes the stored file best-effort. */
export async function removeCoverPhoto(): Promise<CoverActionResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, coverPhotoKey: true },
  });
  if (!profile || !profile.coverPhotoKey) {
    return { success: true, coverUrl: null, coverKey: null };
  }
  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: {
      coverPhotoKey: null,
      coverPhotoFocalX: 0.5,
      coverPhotoFocalY: 0.5,
      coverPhotoZoom: 1.0,
    },
  });
  await deleteCover(profile.coverPhotoKey);
  return { success: true, coverUrl: null, coverKey: null };
}

// --- Stage 7A4D2: cover position + zoom -------------------------------------

const coverPositionSchema = z.strictObject({
  focalX: z.number().min(0).max(1),
  focalY: z.number().min(0).max(1),
  zoom: z.number().min(1).max(2.5),
  // Optimistic concurrency — stale editors can't clobber a replaced cover.
  expectedCoverPhotoKey: z.string().min(1),
});

/**
 * Persists presentation metadata only — the stored WebP master is never
 * touched. Rejects if the cover changed while the editor was open.
 */
export async function updateCoverPosition(
  raw: unknown,
): Promise<CoverActionResult> {
  const { candidate } = await requireCandidateSession();
  const parsed = coverPositionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Invalid cover position." };
  }
  const { focalX, focalY, zoom, expectedCoverPhotoKey } = parsed.data;
  if (!Number.isFinite(focalX + focalY + zoom)) {
    return { success: false, message: "Invalid cover position." };
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, slug: true, coverPhotoKey: true },
  });
  if (!profile?.coverPhotoKey) {
    return { success: false, message: "Upload a cover photo first." };
  }
  if (profile.coverPhotoKey !== expectedCoverPhotoKey) {
    return {
      success: false,
      message: "Your cover photo changed. Reopen the editor and try again.",
    };
  }

  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: {
      coverPhotoFocalX: focalX,
      coverPhotoFocalY: focalY,
      coverPhotoZoom: zoom,
    },
  });
  return {
    success: true,
    coverUrl: `/u/${profile.slug}/cover`,
    coverKey: profile.coverPhotoKey,
  };
}
