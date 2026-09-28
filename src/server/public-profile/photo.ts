import "server-only";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";
import {
  deletePhoto,
  newPhotoKey,
  normalizePhoto,
  writePhoto,
} from "@/server/profile-photo/store";

export type PhotoActionResult =
  | { success: true; photoUrl: string | null }
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
      data: { profilePhotoKey: newKey },
    });
  } catch {
    await deletePhoto(newKey); // drop the orphan — old photo stays intact
    return { success: false, message: "Upload failed. Try again." };
  }

  // New key persisted — best-effort delete of the previous photo.
  if (profile.profilePhotoKey) await deletePhoto(profile.profilePhotoKey);
  return { success: true, photoUrl: `/u/${profile.slug}/photo` };
}

/** Clears the photo key first, then removes the stored file best-effort. */
export async function removeProfilePhoto(): Promise<PhotoActionResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    select: { id: true, profilePhotoKey: true },
  });
  if (!profile || !profile.profilePhotoKey) {
    return { success: true, photoUrl: null };
  }
  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: { profilePhotoKey: null },
  });
  await deletePhoto(profile.profilePhotoKey);
  return { success: true, photoUrl: null };
}
