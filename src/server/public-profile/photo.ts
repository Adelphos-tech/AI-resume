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
 * Upload / replace the candidate's Career Card photo.
 * Safe order: validate → normalize → write new → persist key → delete old.
 * On persistence failure the new orphan is removed and the old photo stays.
 */
export async function uploadProfilePhoto(
  formData: FormData,
): Promise<PhotoActionResult> {
  const { candidate } = await requireCandidateSession();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Choose a photo to upload." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { success: false, message: "Photo is larger than 8 MB." };
  }

  const normalized = await normalizePhoto(
    Buffer.from(await file.arrayBuffer()),
  );
  if (!normalized.ok) return { success: false, message: normalized.message };

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
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
