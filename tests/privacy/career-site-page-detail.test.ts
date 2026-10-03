import { beforeEach, describe, expect, it, vi } from "vitest";

const pageFindUnique = vi.fn();
const blockCreate = vi.fn();
const blockFindMany = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: { create: blockCreate, findMany: blockFindMany },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const {
  getCandidateCareerSitePage,
  getMyCareerSitePage,
  listMyCareerSiteBlocks,
} = await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbbbbbb";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const BLOCK_HERO = {
  id: "cblockaaaaaaaaaaaaaaaaaaa",
  careerSitePageId: PAGE_A,
  type: "HERO",
  position: 0,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};
const BLOCK_TEXT = {
  ...BLOCK_HERO,
  id: "cblockbbbbbbbbbbbbbbbbbbb",
  type: "CUSTOM_TEXT",
  position: 1,
};

function ownedPageRow(candidateId: string) {
  return {
    id: PAGE_A,
    careerSiteId: "csiteaaaaaaaaaaaaaaaaaaaa",
    title: "About",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    careerSite: { candidateId },
  };
}

describe("CareerSitePage detail — ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retrieves an owned page through the session path", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_A));
    const result = await getMyCareerSitePage(PAGE_A);
    expect(result.success).toBe(true);
    expect(result).toMatchObject({
      page: { id: PAGE_A, title: "About" },
    });
  });

  it("rejects a page owned by another candidate", async () => {
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_B));
    const result = await getCandidateCareerSitePage(CANDIDATE_A, PAGE_A);
    expect(result).toEqual({ success: false, message: "Page not found." });
  });

  it("returns the same not-found for a missing page", async () => {
    pageFindUnique.mockResolvedValue(null);
    const result = await getCandidateCareerSitePage(CANDIDATE_A, PAGE_A);
    expect(result).toEqual({ success: false, message: "Page not found." });
  });

  it("rejects a malformed pageId without touching the database", async () => {
    const result = await getCandidateCareerSitePage(CANDIDATE_A, "bogus");
    expect(result.success).toBe(false);
    expect(pageFindUnique).not.toHaveBeenCalled();
  });
});

describe("CareerSitePage detail — blocks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an empty block list for a zero-block page", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_A));
    blockFindMany.mockResolvedValue([]);
    const result = await listMyCareerSiteBlocks(PAGE_A);
    expect(result).toMatchObject({ success: true, blocks: [] });
  });

  it("lists only that page's blocks in position order", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_A));
    blockFindMany.mockResolvedValue([BLOCK_HERO, BLOCK_TEXT]);
    const result = await listMyCareerSiteBlocks(PAGE_A);
    expect(result).toMatchObject({
      success: true,
      blocks: [
        { id: BLOCK_HERO.id, type: "HERO", position: 0 },
        { id: BLOCK_TEXT.id, type: "CUSTOM_TEXT", position: 1 },
      ],
    });
    expect(blockFindMany).toHaveBeenCalledWith({
      where: { careerSitePageId: PAGE_A },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
  });

  it("cannot list blocks on a foreign-owned page", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_B));
    const result = await listMyCareerSiteBlocks(PAGE_A);
    expect(result.success).toBe(false);
    expect(blockFindMany).not.toHaveBeenCalled();
  });

  it("opening a page detail creates zero blocks", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue(ownedPageRow(CANDIDATE_A));
    await getMyCareerSitePage(PAGE_A);
    expect(blockCreate).not.toHaveBeenCalled();
  });
});
