import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

const candidateIdSchema = z.cuid();

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
