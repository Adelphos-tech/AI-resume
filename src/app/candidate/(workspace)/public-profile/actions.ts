"use server";

import { revalidatePath } from "next/cache";

import {
  createPublicProfile,
  setPublicProfilePublished,
  updatePublicProfileSettings,
  updatePublicProfileSlug,
} from "@/server/public-profile/public-profile";

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
