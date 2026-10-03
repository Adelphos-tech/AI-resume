import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

const candidateIdSchema = z.cuid();

const createPageSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
});

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
