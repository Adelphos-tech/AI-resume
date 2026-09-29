import "server-only";

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
      data: { coverPhotoKey: newKey },
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
    data: { coverPhotoKey: null },
  });
  await deleteCover(profile.coverPhotoKey);
  return { success: true, coverUrl: null, coverKey: null };
}
