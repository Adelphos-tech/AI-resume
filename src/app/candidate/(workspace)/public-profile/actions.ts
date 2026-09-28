"use server";

import { revalidatePath } from "next/cache";

import {
  createPublicProfile,
  setPublicProfilePublished,
  updatePublicProfileSettings,
  updatePublicProfileSlug,
} from "@/server/public-profile/public-profile";
import {
  removeProfilePhoto,
  updatePhotoPosition,
} from "@/server/public-profile/photo";

const PATHS = ["/candidate/public-profile"];

function revalidate() {
  for (const p of PATHS) revalidatePath(p);
}

export async function createPublicProfileAction() {
  const result = await createPublicProfile();
  if (result.success) revalidate();
  return result;
}

export async function updateSlugAction(rawSlug: unknown) {
  const result = await updatePublicProfileSlug(rawSlug);
  if (result.success) revalidate();
  return result;
}

export async function publishPublicProfileAction() {
  const result = await setPublicProfilePublished(true);
  if (result.success) revalidate();
  return result;
}

export async function unpublishPublicProfileAction() {
  const result = await setPublicProfilePublished(false);
  if (result.success) revalidate();
  return result;
}

export async function savePublicProfileSettingsAction(raw: unknown) {
  const result = await updatePublicProfileSettings(raw);
  if (result.success) revalidate();
  return result;
}

// --- Stage 7A4B1: remove photo — Server Action (no body-size concern) ---
// Uploads go through POST /api/candidate/public-profile/photo instead, since
// Server Actions cap request bodies at 1 MB.

export async function removeProfilePhotoAction() {
  const result = await removeProfilePhoto();
  if (result.success) revalidate();
  return result;
}

export async function updatePhotoPositionAction(raw: unknown) {
  const result = await updatePhotoPosition(raw);
  if (result.success) revalidate();
  return result;
}
