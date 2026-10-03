"use server";

import { revalidatePath } from "next/cache";

import { createMyCareerSite } from "@/server/career-site/career-site";

export async function createCareerSiteAction() {
  const result = await createMyCareerSite();
  if (result.success) revalidatePath("/candidate/career-site");
  return result;
}
