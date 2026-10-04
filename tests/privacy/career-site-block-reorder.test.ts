import { beforeEach, describe, expect, it, vi } from "vitest";

const pageFindUnique = vi.fn();
const blockFindMany = vi.fn();
const blockUpdate = vi.fn();
const blockCreate = vi.fn();
const blockDelete = vi.fn();
const transaction = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: {
      findMany: blockFindMany,
      update: blockUpdate,
      create: blockCreate,
      delete: blockDelete,
    },
    $transaction: transaction,
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const { reorderCandidateCareerSiteBlocks, reorderMyCareerSiteBlocks } =
  await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbbbbbb";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const BLOCK_A = "cblockaaaaaaaaaaaaaaaaaaa";
const BLOCK_B = "cblockbbbbbbbbbbbbbbbbbbb";
const BLOCK_C = "cblockccccccccccccccccccc";
const BLOCK_FOREIGN = "cblockfffffffffffffffffff";

function ownPage() {
  return { id: PAGE_A, careerSite: { candidateId: CANDIDATE_A } };
}
function ids(...list: string[]) {
  return list.map((id) => ({ id }));
}

describe("career site block reorder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pageFindUnique.mockResolvedValue(ownPage());
    blockFindMany.mockResolvedValue(ids(BLOCK_A, BLOCK_B, BLOCK_C));
    // transaction passes through and resolves each op against update spy
    transaction.mockImplementation(async (ops: Array<Promise<unknown>>) => ops);
    blockUpdate.mockResolvedValue({});
  });

  it("rewrites positions contiguously in submitted order", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_C, BLOCK_A, BLOCK_B],
    });
    expect(result).toEqual({ success: true });
    expect(blockUpdate.mock.calls).toEqual([
      [{ where: { id: BLOCK_C }, data: { position: 0 } }],
      [{ where: { id: BLOCK_A }, data: { position: 1 } }],
      [{ where: { id: BLOCK_B }, data: { position: 2 } }],
    ]);
  });

  it("runs all position updates inside one transaction", async () => {
    await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_B, BLOCK_C, BLOCK_A],
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0][0]).toHaveLength(3);
  });

  it("creates and deletes nothing during reorder", async () => {
    await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
    });
    expect(blockCreate).not.toHaveBeenCalled();
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("rejects a list missing an existing block", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
    expect(blockUpdate).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("rejects an unknown block id", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_FOREIGN],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
    expect(blockUpdate).not.toHaveBeenCalled();
  });

  it("rejects a foreign block id — same failure as unknown", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_FOREIGN],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
  });

  it("rejects duplicate block ids", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_A, BLOCK_B],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
    expect(blockUpdate).not.toHaveBeenCalled();
  });

  it("rejects an over-length list even before the db read shape changes", async () => {
    blockFindMany.mockResolvedValue(ids(BLOCK_A, BLOCK_B));
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
  });

  it("rejects extra input keys", async () => {
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
      positions: [0, 1, 2],
    });
    expect(result).toEqual({ success: false, message: "Invalid input." });
    expect(blockUpdate).not.toHaveBeenCalled();
  });

  it("rejects reorder on a foreign candidate's page", async () => {
    pageFindUnique.mockResolvedValue({
      id: PAGE_A,
      careerSite: { candidateId: CANDIDATE_B },
    });
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
    expect(blockFindMany).not.toHaveBeenCalled();
  });

  it("returns identical not-found for a missing page", async () => {
    pageFindUnique.mockResolvedValue(null);
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
  });

  it("zero-block page + [] is a safe no-op", async () => {
    blockFindMany.mockResolvedValue([]);
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [],
    });
    expect(result).toEqual({ success: true });
    expect(blockUpdate).not.toHaveBeenCalled();
    expect(blockCreate).not.toHaveBeenCalled();
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("single block canonicalizes to position 0", async () => {
    blockFindMany.mockResolvedValue(ids(BLOCK_B));
    const result = await reorderCandidateCareerSiteBlocks(CANDIDATE_A, PAGE_A, {
      blockIds: [BLOCK_B],
    });
    expect(result).toEqual({ success: true });
    expect(blockUpdate).toHaveBeenCalledWith({
      where: { id: BLOCK_B },
      data: { position: 0 },
    });
  });

  it("session wrapper derives the candidate from requireCandidateSession", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    pageFindUnique.mockResolvedValue({
      id: PAGE_A,
      careerSite: { candidateId: CANDIDATE_B },
    });
    const result = await reorderMyCareerSiteBlocks(PAGE_A, {
      blockIds: [BLOCK_A, BLOCK_B, BLOCK_C],
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
  });
});
