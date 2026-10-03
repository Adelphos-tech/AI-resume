import { beforeEach, describe, expect, it, vi } from "vitest";

const siteFindUnique = vi.fn();
const pageFindUnique = vi.fn();
const pageCreate = vi.fn();
const blockCreate = vi.fn();
const blockFindMany = vi.fn();
const blockAggregate = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSite: { findUnique: siteFindUnique },
    careerSitePage: { findUnique: pageFindUnique, create: pageCreate },
    careerSiteBlock: { create: blockCreate, findMany: blockFindMany },
    $transaction: (fn: (tx: object) => Promise<unknown>) =>
      fn({
        careerSiteBlock: {
          aggregate: blockAggregate,
          create: blockCreate,
        },
      }),
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const {
  createCandidateCareerSiteBlock,
  listCandidateCareerSiteBlocks,
  createCandidateCareerSitePage,
  createMyCareerSiteBlock,
  listMyCareerSiteBlocks,
} = await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbbbbbb";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const PAGE_B = "cpagebbbbbbbbbbbbbbbbbbbb";
const BLOCK = {
  id: "cblockaaaaaaaaaaaaaaaaaaa",
  careerSitePageId: PAGE_A,
  type: "HERO",
  position: 0,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

function pageRow(candidateId: string) {
  return { id: PAGE_A, careerSite: { candidateId } };
}

describe("CareerSiteBlock — creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a block on a page owned by the candidate", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_A));
    blockAggregate.mockResolvedValue({ _max: { position: null } });
    blockCreate.mockResolvedValue(BLOCK);
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "HERO",
    });
    expect(result.success).toBe(true);
  });

  it("assigns position 0 to the first block on a page", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_A));
    blockAggregate.mockResolvedValue({ _max: { position: null } });
    blockCreate.mockResolvedValue(BLOCK);
    await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "HERO",
    });
    expect(blockCreate).toHaveBeenCalledWith({
      data: { careerSitePageId: PAGE_A, type: "HERO", position: 0 },
    });
  });

  it("assigns the next sequential position to later blocks", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_A));
    blockAggregate.mockResolvedValue({ _max: { position: 3 } });
    blockCreate.mockResolvedValue({ ...BLOCK, position: 4 });
    await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "CUSTOM_TEXT",
    });
    expect(blockCreate).toHaveBeenCalledWith({
      data: { careerSitePageId: PAGE_A, type: "CUSTOM_TEXT", position: 4 },
    });
  });

  it("rejects an unknown block type without touching the database", async () => {
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "INSTAGRAM_FEED",
    });
    expect(result.success).toBe(false);
    expect(pageFindUnique).not.toHaveBeenCalled();
  });

  it("cannot receive a caller-supplied position", async () => {
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "HERO",
      position: 99,
    });
    expect(result.success).toBe(false);
    expect(blockCreate).not.toHaveBeenCalled();
  });

  it("rejects a page owned by another candidate", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_B));
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "HERO",
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
    expect(blockCreate).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent page with the same not-found message", async () => {
    pageFindUnique.mockResolvedValue(null);
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_B, {
      type: "HERO",
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
  });

  it("session wrapper derives ownership from the session candidate", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_B));
    const result = await createMyCareerSiteBlock(PAGE_A, { type: "HERO" });
    expect(result.success).toBe(false);
  });
});

describe("CareerSiteBlock — listing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns blocks ordered by position then id", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_A));
    blockFindMany.mockResolvedValue([BLOCK]);
    const result = await listCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A);
    expect(result.success).toBe(true);
    expect(blockFindMany).toHaveBeenCalledWith({
      where: { careerSitePageId: PAGE_A },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
  });

  it("returns an empty list for a valid page with zero blocks", async () => {
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_A));
    blockFindMany.mockResolvedValue([]);
    const result = await listCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A);
    expect(result).toMatchObject({ success: true, blocks: [] });
  });

  it("rejects a foreign-owned page in the session path", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(pageRow(CANDIDATE_B));
    const result = await listMyCareerSiteBlocks(PAGE_A);
    expect(result.success).toBe(false);
    expect(blockFindMany).not.toHaveBeenCalled();
  });
});

describe("CareerSitePage lifecycle — no implicit blocks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creating a page never creates a block", async () => {
    siteFindUnique.mockResolvedValue({
      id: "csitea",
      candidateId: CANDIDATE_A,
    });
    pageCreate.mockResolvedValue({
      id: PAGE_A,
      careerSiteId: "csitea",
      title: "About",
    });
    const result = await createCandidateCareerSitePage(CANDIDATE_A, {
      title: "About",
    });
    expect(result.success).toBe(true);
    expect(pageCreate).toHaveBeenCalledWith({
      data: { careerSiteId: "csitea", title: "About" },
    });
    expect(blockCreate).not.toHaveBeenCalled();
  });
});
