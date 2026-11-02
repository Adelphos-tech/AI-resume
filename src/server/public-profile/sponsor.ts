import "server-only";

import { prisma } from "@/server/db";
import {
  deleteSponsorImage,
  newSponsorImageKey,
  normalizeSponsorImage,
  writeSponsorImage,
} from "@/server/sponsor-images/store";

export type SponsorSlot = 1 | 2;

export function parseSponsorSlot(raw: string): SponsorSlot | null {
  return raw === "1" ? (1 as const) : raw === "2" ? (2 as const) : null;
}

const KEY_FIELD = {
  1: "sponsorOneImageKey",
  2: "sponsorTwoImageKey",
} as const;

export type SponsorActionResult =
  | { success: true; imageUrl: string | null }
  | { success: false; message: string };

/**
 * Sponsor image pipeline — same safe ordering as profile/cover photos and
 * the company logo: validate → normalize → write new → persist key →
 * delete old. A failed step never destroys the previous valid image.
 */
export async function saveSponsorImage(
  candidateId: string,
  slot: SponsorSlot,
  bytes: Buffer,
): Promise<SponsorActionResult> {
  const normalized = await normalizeSponsorImage(bytes);
  if (!normalized.ok) return { success: false, message: normalized.message };

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: {
      id: true,
      slug: true,
      sponsorOneImageKey: true,
      sponsorTwoImageKey: true,
    },
  });
  if (!profile) {
    return { success: false, message: "Create your Career Card first." };
  }

  const field = KEY_FIELD[slot];
  const newKey = newSponsorImageKey();
  try {
    await writeSponsorImage(newKey, normalized.buffer);
  } catch {
    return { success: false, message: "Upload failed. Try again." };
  }

  try {
    await prisma.publicProfile.update({
      where: { id: profile.id },
      data: { [field]: newKey },
    });
  } catch {
    await deleteSponsorImage(newKey);
    return { success: false, message: "Upload failed. Try again." };
  }

  const oldKey = profile[field];
  if (oldKey) await deleteSponsorImage(oldKey);
  return { success: true, imageUrl: `/u/${profile.slug}/sponsor/${slot}` };
}

/** Removes the stored image for a slot; the optional URL is cleared with
 *  it so a link never dangles without an image. */
export async function removeSponsorImage(
  candidateId: string,
  slot: SponsorSlot,
): Promise<SponsorActionResult> {
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId },
    select: {
      id: true,
      sponsorOneImageKey: true,
      sponsorTwoImageKey: true,
    },
  });
  if (!profile) {
    return { success: false, message: "Create your Career Card first." };
  }

  const field = KEY_FIELD[slot];
  const urlField = slot === 1 ? "sponsorOneUrl" : "sponsorTwoUrl";
  const oldKey = profile[field];
  if (!oldKey) return { success: true, imageUrl: null };

  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: { [field]: null, [urlField]: null },
  });
  await deleteSponsorImage(oldKey);
  return { success: true, imageUrl: null };
}
