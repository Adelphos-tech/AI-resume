import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { candidateListQuerySchema } from "@/server/candidates/schema";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

export const CANDIDATE_PAGE_SIZE = 20;

const candidateListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  package: true,
  status: true,
  createdAt: true,
} satisfies Prisma.CandidateSelect;

export type CandidateListItem = Prisma.CandidateGetPayload<{
  select: typeof candidateListSelect;
}>;

export interface CandidateListResult {
  items: CandidateListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listCandidates(
  rawQuery: unknown,
): Promise<CandidateListResult> {
  await requireInternalSession();

  const {
    q,
    status,
    package: pkg,
    page,
  } = candidateListQuerySchema.parse(rawQuery);

  const where: Prisma.CandidateWhereInput = {
    AND: [
      status ? { status } : {},
      pkg ? { package: pkg } : {},
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const total = await prisma.candidate.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / CANDIDATE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const items = await prisma.candidate.findMany({
    where,
    select: candidateListSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (safePage - 1) * CANDIDATE_PAGE_SIZE,
    take: CANDIDATE_PAGE_SIZE,
  });

  return {
    items,
    total,
    page: safePage,
    pageSize: CANDIDATE_PAGE_SIZE,
    totalPages,
  };
}
