"use server";

import { revalidatePath } from "next/cache";

import {
  createMyCareerSite,
  createMyCareerSitePage,
} from "@/server/career-site/career-site";

export async function createCareerSiteAction() {
  const result = await createMyCareerSite();
  if (result.success) revalidatePath("/candidate/career-site");
  return result;
}

export async function createCareerSitePageAction(input: unknown) {
  const result = await createMyCareerSitePage(input);
  if (result.success) revalidatePath("/candidate/career-site");
  return result;
}
