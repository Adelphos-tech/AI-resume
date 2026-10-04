import { beforeEach, describe, expect, it, vi } from "vitest";

const blockFindUnique = vi.fn();
const blockDelete = vi.fn();
const blockUpdate = vi.fn();
const blockUpdateMany = vi.fn();
const blockDeleteMany = vi.fn();
const pageUpdate = vi.fn();
const siteUpdate = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSite: { update: siteUpdate },
    careerSitePage: { update: pageUpdate },
    careerSiteBlock: {
      findUnique: blockFindUnique,
      delete: blockDelete,
      deleteMany: blockDeleteMany,
      update: blockUpdate,
      updateMany: blockUpdateMany,
    },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const { deleteCandidateCareerSiteBlock, deleteMyCareerSiteBlock } =
  await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbbbbbb";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const PAGE_B = "cpagebbbbbbbbbbbbbbbbbbbb";
const BLOCK_ID = "cblockaaaaaaaaaaaaaaaaaaa";

function blockRow(opts: {
  candidateId: string;
  pageId: string;
  type?: string;
}) {
  return {
    id: BLOCK_ID,
    careerSitePageId: opts.pageId,
    type: opts.type ?? "CUSTOM_TEXT",
    position: 0,
    content: null,
    page: { careerSite: { candidateId: opts.candidateId } },
  };
}

describe("career site block delete — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blockDelete.mockResolvedValue({});
  });

  it.each(["HERO", "CUSTOM_TEXT"] as const)(
    "deletes exactly the owned %s block by id",
    async (type) => {
      blockFindUnique.mockResolvedValue(
        blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_A, type }),
      );
      const result = await deleteCandidateCareerSiteBlock(
        CANDIDATE_A,
        PAGE_A,
        BLOCK_ID,
      );
      expect(result).toEqual({ success: true });
      expect(blockDelete).toHaveBeenCalledWith({ where: { id: BLOCK_ID } });
      expect(blockDelete).toHaveBeenCalledTimes(1);
    },
  );

  it("does not mutate neighboring blocks, the page, or the site", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_A }),
    );
    await deleteCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, BLOCK_ID);
    expect(blockDeleteMany).not.toHaveBeenCalled();
    expect(blockUpdate).not.toHaveBeenCalled();
    expect(blockUpdateMany).not.toHaveBeenCalled();
    expect(pageUpdate).not.toHaveBeenCalled();
    expect(siteUpdate).not.toHaveBeenCalled();
  });
});

describe("career site block delete — ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blockDelete.mockResolvedValue({});
  });

  it("rejects a block owned by another candidate", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_B, pageId: PAGE_A }),
    );
    const result = await deleteCandidateCareerSiteBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("rejects when the block belongs to a different page than claimed", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_B }),
    );
    const result = await deleteCandidateCareerSiteBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("returns identical not-found for a missing block", async () => {
    blockFindUnique.mockResolvedValue(null);
    const result = await deleteCandidateCareerSiteBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("rejects malformed identifiers without touching persistence", async () => {
    const result = await deleteCandidateCareerSiteBlock(
      "not-a-cuid",
      PAGE_A,
      BLOCK_ID,
    );
    expect(result).toEqual({ success: false, message: "Invalid input." });
    expect(blockFindUnique).not.toHaveBeenCalled();
    expect(blockDelete).not.toHaveBeenCalled();
  });

  it("session wrapper derives the candidate from requireCandidateSession", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_B, pageId: PAGE_A }),
    );
    const result = await deleteMyCareerSiteBlock(PAGE_A, BLOCK_ID);
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(blockDelete).not.toHaveBeenCalled();
  });
});
