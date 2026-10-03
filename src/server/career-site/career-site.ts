import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

const candidateIdSchema = z.cuid();

const createPageSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
});

const createBlockSchema = z.strictObject({
  type: z.enum(["HERO", "CUSTOM_TEXT"]),
});

const pageIdSchema = z.cuid();

export type CareerSiteBlock = {
  id: string;
  careerSitePageId: string;
  type: "HERO" | "CUSTOM_TEXT";
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerSiteBlocksResult =
  | { success: true; blocks: CareerSiteBlock[] }
  | { success: false; message: string };

export type CareerSiteBlockResult =
  | { success: true; block: CareerSiteBlock }
  | { success: false; message: string };

/**
 * Resolves the page only when the ownership chain proves it belongs to
 * the candidate's CareerSite — existence is never revealed otherwise.
 */
async function ownedPage(candidateId: string, pageId: string) {
  const page = await prisma.careerSitePage.findUnique({
    where: { id: pageId },
    include: { careerSite: { select: { candidateId: true } } },
  });
  if (!page || page.careerSite.candidateId !== candidateId) return null;
  return page;
}

export type CareerSitePage = {
  id: string;
  careerSiteId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerSitePagesResult =
  | { success: true; pages: CareerSitePage[] }
  | { success: false; message: string };

export type CareerSitePageResult =
  { success: true; page: CareerSitePage } | { success: false; message: string };

export type CareerSite = {
  id: string;
  candidateId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerSiteResult =
  | { success: true; careerSite: CareerSite }
  | { success: false; message: string };

/**
 * Authorization-free core: callers MUST enforce their own session boundary.
 * `candidateId` is always the session-owned Candidate id.
 */
export async function getCandidateCareerSite(
  candidateId: string,
): Promise<CareerSiteResult> {
  const parsed = candidateIdSchema.safeParse(candidateId);
  if (!parsed.success) return { success: false, message: "Not found." };

  const careerSite = await prisma.careerSite.findUnique({
    where: { candidateId: parsed.data },
  });
  if (!careerSite) return { success: false, message: "Career Site not found." };
  return { success: true, careerSite };
}

/**
 * Explicit creation only. Repeated creation returns the existing site —
 * the unique `candidateId` constraint is the final authority.
 */
export async function createCandidateCareerSite(
  candidateId: string,
): Promise<CareerSiteResult> {
  const parsed = candidateIdSchema.safeParse(candidateId);
  if (!parsed.success) return { success: false, message: "Not found." };

  const existing = await prisma.careerSite.findUnique({
    where: { candidateId: parsed.data },
  });
  if (existing) return { success: true, careerSite: existing };

  try {
    const careerSite = await prisma.careerSite.create({
      data: { candidateId: parsed.data },
    });
    return { success: true, careerSite };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const raced = await prisma.careerSite.findUnique({
        where: { candidateId: parsed.data },
      });
      if (raced) return { success: true, careerSite: raced };
    }
    throw e;
  }
}

/**
 * Candidate-facing entry points: identity always comes from the
 * authenticated session — the browser never supplies a candidateId.
 */
export async function getMyCareerSite(): Promise<CareerSiteResult> {
  const { candidate } = await requireCandidateSession();
  return getCandidateCareerSite(candidate.id);
}

export async function createMyCareerSite(): Promise<CareerSiteResult> {
  const { candidate } = await requireCandidateSession();
  return createCandidateCareerSite(candidate.id);
}

/**
 * Pages: ownership is always derived through the session-owned
 * Candidate → CareerSite chain. Never accepts a careerSiteId from the
 * caller. A Candidate with no CareerSite cannot create pages —
 * CareerSite creation stays explicit.
 */
export async function createCandidateCareerSitePage(
  candidateId: string,
  input: unknown,
): Promise<CareerSitePageResult> {
  const candidate = candidateIdSchema.safeParse(candidateId);
  const body = createPageSchema.safeParse(input);
  if (!candidate.success || !body.success) {
    return { success: false, message: "Invalid input." };
  }

  const site = await prisma.careerSite.findUnique({
    where: { candidateId: candidate.data },
  });
  if (!site) {
    return { success: false, message: "Career Site not found." };
  }

  const page = await prisma.careerSitePage.create({
    data: { careerSiteId: site.id, title: body.data.title },
  });
  return { success: true, page };
}

export async function listCandidateCareerSitePages(
  candidateId: string,
): Promise<CareerSitePagesResult> {
  const parsed = candidateIdSchema.safeParse(candidateId);
  if (!parsed.success) return { success: false, message: "Not found." };

  const site = await prisma.careerSite.findUnique({
    where: { candidateId: parsed.data },
  });
  if (!site) return { success: false, message: "Career Site not found." };

  const pages = await prisma.careerSitePage.findMany({
    where: { careerSiteId: site.id },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return { success: true, pages };
}

export async function createMyCareerSitePage(
  input: unknown,
): Promise<CareerSitePageResult> {
  const { candidate } = await requireCandidateSession();
  return createCandidateCareerSitePage(candidate.id, input);
}

export async function listMyCareerSitePages(): Promise<CareerSitePagesResult> {
  const { candidate } = await requireCandidateSession();
  return listCandidateCareerSitePages(candidate.id);
}

/**
 * Retrieves one page only when the ownership chain proves it belongs to
 * the candidate's CareerSite — pageId alone never grants access.
 */
export async function getCandidateCareerSitePage(
  candidateId: string,
  pageId: string,
): Promise<CareerSitePageResult> {
  const candidate = candidateIdSchema.safeParse(candidateId);
  const parsedPageId = pageIdSchema.safeParse(pageId);
  if (!candidate.success || !parsedPageId.success) {
    return { success: false, message: "Page not found." };
  }

  const owned = await ownedPage(candidate.data, parsedPageId.data);
  if (!owned) return { success: false, message: "Page not found." };

  return {
    success: true,
    page: {
      id: owned.id,
      careerSiteId: owned.careerSiteId,
      title: owned.title,
      createdAt: owned.createdAt,
      updatedAt: owned.updatedAt,
    },
  };
}

export async function getMyCareerSitePage(
  pageId: string,
): Promise<CareerSitePageResult> {
  const { candidate } = await requireCandidateSession();
  return getCandidateCareerSitePage(candidate.id, pageId);
}

/**
 * Blocks: ownership is proven through Candidate → CareerSite → Page.
 * Position is computed server-side (max+1, 0-based) inside a transaction;
 * the caller never supplies it. A page the candidate does not own is
 * indistinguishable from a missing one.
 */
export async function createCandidateCareerSiteBlock(
  candidateId: string,
  pageId: string,
  input: unknown,
): Promise<CareerSiteBlockResult> {
  const candidate = candidateIdSchema.safeParse(candidateId);
  const page = pageIdSchema.safeParse(pageId);
  const body = createBlockSchema.safeParse(input);
  if (!candidate.success || !page.success || !body.success) {
    return { success: false, message: "Invalid input." };
  }

  const owned = await ownedPage(candidate.data, page.data);
  if (!owned) return { success: false, message: "Page not found." };

  const block = await prisma.$transaction(async (tx) => {
    const max = await tx.careerSiteBlock.aggregate({
      where: { careerSitePageId: page.data },
      _max: { position: true },
    });
    return tx.careerSiteBlock.create({
      data: {
        careerSitePageId: page.data,
        type: body.data.type,
        position: (max._max.position ?? -1) + 1,
      },
    });
  });
  return { success: true, block };
}

export async function listCandidateCareerSiteBlocks(
  candidateId: string,
  pageId: string,
): Promise<CareerSiteBlocksResult> {
  const candidate = candidateIdSchema.safeParse(candidateId);
  const page = pageIdSchema.safeParse(pageId);
  if (!candidate.success || !page.success) {
    return { success: false, message: "Not found." };
  }

  const owned = await ownedPage(candidate.data, page.data);
  if (!owned) return { success: false, message: "Page not found." };

  const blocks = await prisma.careerSiteBlock.findMany({
    where: { careerSitePageId: page.data },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  return { success: true, blocks };
}

export async function createMyCareerSiteBlock(
  pageId: string,
  input: unknown,
): Promise<CareerSiteBlockResult> {
  const { candidate } = await requireCandidateSession();
  return createCandidateCareerSiteBlock(candidate.id, pageId, input);
}

export async function listMyCareerSiteBlocks(
  pageId: string,
): Promise<CareerSiteBlocksResult> {
  const { candidate } = await requireCandidateSession();
  return listCandidateCareerSiteBlocks(candidate.id, pageId);
}
