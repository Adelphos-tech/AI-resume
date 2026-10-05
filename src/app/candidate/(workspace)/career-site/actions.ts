"use server";

import { revalidatePath } from "next/cache";

import {
  createMyCareerSite,
  createMyCareerSiteBlock,
  createMyCareerSitePage,
  deleteMyCareerSiteBlock,
  reorderMyCareerSiteBlocks,
  updateMyCustomTextBlock,
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

export async function createCareerSiteBlockAction(
  pageId: string,
  input: unknown,
) {
  const result = await createMyCareerSiteBlock(pageId, input);
  if (result.success) {
    revalidatePath(`/candidate/career-site/pages/${pageId}`);
  }
  return result;
}

export async function updateCustomTextBlockAction(
  pageId: string,
  blockId: string,
  input: unknown,
) {
  const result = await updateMyCustomTextBlock(pageId, blockId, input);
  if (result.success) {
    revalidatePath(`/candidate/career-site/pages/${pageId}`);
  }
  return result;
}

export async function deleteCareerSiteBlockAction(
  pageId: string,
  blockId: string,
) {
  const result = await deleteMyCareerSiteBlock(pageId, blockId);
  if (result.success) {
    revalidatePath(`/candidate/career-site/pages/${pageId}`);
  }
  return result;
}

export async function reorderCareerSiteBlocksAction(
  pageId: string,
  input: unknown,
) {
  const result = await reorderMyCareerSiteBlocks(pageId, input);
  if (result.success) {
    revalidatePath(`/candidate/career-site/pages/${pageId}`);
  }
  return result;
}
