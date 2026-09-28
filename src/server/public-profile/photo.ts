import "server-only";

import { z } from "zod";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";
import {
  deletePhoto,
  newPhotoKey,
  normalizePhoto,
  writePhoto,
} from "@/server/profile-photo/store";

export type PhotoActionResult =
  | { success: true; photoUrl: string | null; photoKey: string | null }
  | { success: false; message: string };

/**
 * Shared photo pipeline — used by the dedicated multipart upload route.
 * Safe order: validate → normalize → write new → persist key → delete old.
 * On persistence failure the new orphan is removed and the old photo stays.
 * Ownership comes from the authenticated candidate session — never from a
 * client-supplied candidateId/profileId.
 */
export async function saveProfilePhoto(
  candidateId: string,
  bytes: Buffer,
): Promise<PhotoActionResult> {
  const normalized = await normalizePhoto(bytes);
  if (!normalized.ok) return { success: false, message: normalized.message };

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: { id: true, slug: true, profilePhotoKey: true },
  });
  if (!profile) {
    return { success: false, message: "Create your Career Card first." };
  }

  const newKey = newPhotoKey();
  try {
    await writePhoto(newKey, normalized.buffer);
  } catch {
    return { success: false, message: "Upload failed. Try again." };
  }

  try {
    await prisma.publicProfile.update({
      where: { id: profile.id },
      data: {
        profilePhotoKey: newKey,
        // A new photo always starts centered — no stale crop carries over.
        profilePhotoFocalX: 0.5,
        profilePhotoFocalY: 0.5,
        profilePhotoZoom: 1,
      },
    });
  } catch {
    await deletePhoto(newKey); // drop the orphan — old photo stays intact
    return { success: false, message: "Upload failed. Try again." };
  }

  // New key persisted — best-effort delete of the previous photo.
  if (profile.profilePhotoKey) await deletePhoto(profile.profilePhotoKey);
  return {
    success: true,
    photoUrl: `/u/${profile.slug}/photo`,
    photoKey: newKey,
  };
}

/** Clears the photo key first, then removes the stored file best-effort. */
export async function removeProfilePhoto(): Promise<PhotoActionResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, profilePhotoKey: true },
  });
  if (!profile || !profile.profilePhotoKey) {
    return { success: true, photoUrl: null, photoKey: null };
  }
  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: {
      profilePhotoKey: null,
      profilePhotoFocalX: 0.5,
      profilePhotoFocalY: 0.5,
      profilePhotoZoom: 1,
    },
  });
  await deletePhoto(profile.profilePhotoKey);
  return { success: true, photoUrl: null, photoKey: null };
}

// --- Stage 7A4B2: photo position + zoom ------------------------------------

const photoPositionSchema = z.strictObject({
  focalX: z.number().min(0).max(1),
  focalY: z.number().min(0).max(1),
  zoom: z.number().min(1).max(2.5),
  // Optimistic concurrency — stale editors can't clobber a replaced photo.
  expectedPhotoKey: z.string().min(1),
});

/**
 * Persists presentation metadata only — the stored WebP master is never
 * touched. Rejects if the photo changed while the editor was open.
 */
export async function updatePhotoPosition(
  raw: unknown,
): Promise<PhotoActionResult> {
  const { candidate } = await requireCandidateSession();
  const parsed = photoPositionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Invalid photo position." };
  }
  const { focalX, focalY, zoom, expectedPhotoKey } = parsed.data;
  if (!Number.isFinite(focalX + focalY + zoom)) {
    return { success: false, message: "Invalid photo position." };
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, slug: true, profilePhotoKey: true },
  });
  if (!profile?.profilePhotoKey) {
    return { success: false, message: "Upload a profile photo first." };
  }
  if (profile.profilePhotoKey !== expectedPhotoKey) {
    return {
      success: false,
      message: "Your profile photo changed. Reopen the editor and try again.",
    };
  }

  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: {
      profilePhotoFocalX: focalX,
      profilePhotoFocalY: focalY,
      profilePhotoZoom: zoom,
    },
  });
  return {
    success: true,
    photoUrl: `/u/${profile.slug}/photo`,
    photoKey: profile.profilePhotoKey,
  };
}
