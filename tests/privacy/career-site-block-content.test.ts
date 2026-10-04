import { beforeEach, describe, expect, it, vi } from "vitest";

const blockFindUnique = vi.fn();
const blockUpdate = vi.fn();
const blockCreate = vi.fn();
const pageFindUnique = vi.fn();
const blockAggregate = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: {
      findUnique: blockFindUnique,
      update: blockUpdate,
      create: blockCreate,
    },
    $transaction: (fn: (tx: object) => Promise<unknown>) =>
      fn({
        careerSiteBlock: { aggregate: blockAggregate, create: blockCreate },
      }),
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const {
  updateCandidateCustomTextBlock,
  updateMyCustomTextBlock,
  createCandidateCareerSiteBlock,
} = await import("@/server/career-site/career-site");

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

describe("CUSTOM_TEXT content — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_A }),
    );
    blockUpdate.mockImplementation(async ({ data }) => ({
      ...blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_A }),
      content: data.content,
    }));
  });

  it("persists { text } on an owned CUSTOM_TEXT block", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "Hello world" },
    );
    expect(result.success).toBe(true);
    expect(blockUpdate).toHaveBeenCalledWith({
      where: { id: BLOCK_ID },
      data: { content: { text: "Hello world" } },
    });
  });

  it("preserves multi-line text exactly", async () => {
    const text = "First line\nSecond line";
    await updateCandidateCustomTextBlock(CANDIDATE_A, PAGE_A, BLOCK_ID, {
      text,
    });
    expect(blockUpdate).toHaveBeenCalledWith({
      where: { id: BLOCK_ID },
      data: { content: { text: "First line\nSecond line" } },
    });
  });

  it("persists an explicit empty string", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "" },
    );
    expect(result.success).toBe(true);
    expect(blockUpdate).toHaveBeenCalledWith({
      where: { id: BLOCK_ID },
      data: { content: { text: "" } },
    });
  });

  it("accepts the 20k-character boundary", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x".repeat(20000) },
    );
    expect(result.success).toBe(true);
  });

  it("rejects text beyond the limit", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x".repeat(20001) },
    );
    expect(result.success).toBe(false);
    expect(blockUpdate).not.toHaveBeenCalled();
  });

  it("rejects a non-text shape ({ html })", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { html: "<b>x</b>" },
    );
    expect(result.success).toBe(false);
    expect(blockUpdate).not.toHaveBeenCalled();
  });

  it("rejects extra keys ({ text, color })", async () => {
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x", color: "red" },
    );
    expect(result.success).toBe(false);
    expect(blockUpdate).not.toHaveBeenCalled();
  });
});

describe("CUSTOM_TEXT content — type safety", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects the update against a HERO block", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_A, type: "HERO" }),
    );
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x" },
    );
    expect(result.success).toBe(false);
    expect(blockUpdate).not.toHaveBeenCalled();
  });
});

describe("CUSTOM_TEXT content — ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a block owned by another candidate", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_B, pageId: PAGE_A }),
    );
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x" },
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("rejects a block under a different page id", async () => {
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_A, pageId: PAGE_B }),
    );
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x" },
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("returns identical not-found for a missing block", async () => {
    blockFindUnique.mockResolvedValue(null);
    const result = await updateCandidateCustomTextBlock(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_ID,
      { text: "x" },
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("session wrapper derives the candidate from requireCandidateSession", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    blockFindUnique.mockResolvedValue(
      blockRow({ candidateId: CANDIDATE_B, pageId: PAGE_A }),
    );
    const result = await updateMyCustomTextBlock(PAGE_A, BLOCK_ID, {
      text: "x",
    });
    expect(result.success).toBe(false);
    expect(blockUpdate).not.toHaveBeenCalled();
  });
});

describe("creation — content stays uninitialized", () => {
  it("block creation never writes a content field", async () => {
    vi.clearAllMocks();
    pageFindUnique.mockResolvedValue({
      id: PAGE_A,
      careerSite: { candidateId: CANDIDATE_A },
    });
    blockAggregate.mockResolvedValue({ _max: { position: null } });
    blockCreate.mockResolvedValue({ id: BLOCK_ID, position: 0 });
    const result = await createCandidateCareerSiteBlock(CANDIDATE_A, PAGE_A, {
      type: "CUSTOM_TEXT",
    });
    expect(result.success).toBe(true);
    const data = blockCreate.mock.calls[0][0].data as Record<string, unknown>;
    expect("content" in data).toBe(false);
  });
});
