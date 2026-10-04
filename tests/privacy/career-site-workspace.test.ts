import { beforeEach, describe, expect, it, vi } from "vitest";

const createMyCareerSite = vi.fn();
const getMyCareerSite = vi.fn();
const listMyCareerSitePages = vi.fn();
const createMyCareerSitePage = vi.fn();
const createMyCareerSiteBlock = vi.fn();
const updateMyCustomTextBlock = vi.fn();
const deleteMyCareerSiteBlock = vi.fn();

vi.mock("@/server/career-site/career-site", () => ({
  createMyCareerSite,
  getMyCareerSite,
  listMyCareerSitePages,
  createMyCareerSitePage,
  createMyCareerSiteBlock,
  updateMyCustomTextBlock,
  deleteMyCareerSiteBlock,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const {
  createCareerSiteAction,
  createCareerSitePageAction,
  createCareerSiteBlockAction,
  updateCustomTextBlockAction,
  deleteCareerSiteBlockAction,
} = await import("@/app/candidate/(workspace)/career-site/actions");
const { default: CandidateCareerSitePage } =
  await import("@/app/candidate/(workspace)/career-site/page");

const SITE = {
  id: "csiteaaaaaaaaaaaaaaaaaaaa",
  candidateId: "ccaaaaaaaaaaaaaaaaaaaaaaaa",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("career-site workspace — explicit creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("create action delegates to the session-scoped creation path", async () => {
    createMyCareerSite.mockResolvedValue({
      success: true,
      careerSite: SITE,
    });
    const result = await createCareerSiteAction();
    expect(createMyCareerSite).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("does not create a site when the page is rendered without one", async () => {
    getMyCareerSite.mockResolvedValue({
      success: false,
      message: "Career Site not found.",
    });
    await CandidateCareerSitePage();
    expect(getMyCareerSite).toHaveBeenCalledTimes(1);
    expect(createMyCareerSite).not.toHaveBeenCalled();
    expect(listMyCareerSitePages).not.toHaveBeenCalled();
  });

  it("does not create a site when one already exists on render", async () => {
    getMyCareerSite.mockResolvedValue({ success: true, careerSite: SITE });
    listMyCareerSitePages.mockResolvedValue({ success: true, pages: [] });
    await CandidateCareerSitePage();
    expect(createMyCareerSite).not.toHaveBeenCalled();
    expect(listMyCareerSitePages).toHaveBeenCalledTimes(1);
  });
});

describe("career-site pages — workspace action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("page-create action delegates to the session-scoped path", async () => {
    createMyCareerSitePage.mockResolvedValue({
      success: true,
      page: { id: "cpageaaaaaaaaaaaaaaaaaaaa" },
    });
    const result = await createCareerSitePageAction({ title: "About" });
    expect(createMyCareerSitePage).toHaveBeenCalledWith({ title: "About" });
    expect(result.success).toBe(true);
  });

  it("propagates page-create failure without throwing", async () => {
    createMyCareerSitePage.mockResolvedValue({
      success: false,
      message: "Career Site not found.",
    });
    const result = await createCareerSitePageAction({ title: "About" });
    expect(result.success).toBe(false);
  });
});

describe("career-site blocks — workspace action", () => {
  beforeEach(() => vi.clearAllMocks());

  const PAGE_ID = "cpageaaaaaaaaaaaaaaaaaaaa";

  it("delegates to the session-scoped block creation path", async () => {
    createMyCareerSiteBlock.mockResolvedValue({
      success: true,
      block: { id: "cblockaaaaaaaaaaaaaaaaaaa", position: 0 },
    });
    const result = await createCareerSiteBlockAction(PAGE_ID, {
      type: "HERO",
    });
    expect(createMyCareerSiteBlock).toHaveBeenCalledWith(PAGE_ID, {
      type: "HERO",
    });
    expect(result.success).toBe(true);
  });

  it("supports explicit CUSTOM_TEXT creation", async () => {
    createMyCareerSiteBlock.mockResolvedValue({
      success: true,
      block: { id: "cblockbbbbbbbbbbbbbbbbbbb", position: 1 },
    });
    const result = await createCareerSiteBlockAction(PAGE_ID, {
      type: "CUSTOM_TEXT",
    });
    expect(createMyCareerSiteBlock).toHaveBeenCalledWith(PAGE_ID, {
      type: "CUSTOM_TEXT",
    });
    expect(result.success).toBe(true);
  });

  it("propagates domain failure without throwing", async () => {
    createMyCareerSiteBlock.mockResolvedValue({
      success: false,
      message: "Page not found.",
    });
    const result = await createCareerSiteBlockAction(PAGE_ID, {
      type: "HERO",
    });
    expect(result).toEqual({ success: false, message: "Page not found." });
  });

  it("permits repeated creation of the same block type", async () => {
    createMyCareerSiteBlock.mockResolvedValue({ success: true, block: {} });
    const first = await createCareerSiteBlockAction(PAGE_ID, {
      type: "CUSTOM_TEXT",
    });
    const second = await createCareerSiteBlockAction(PAGE_ID, {
      type: "CUSTOM_TEXT",
    });
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(createMyCareerSiteBlock).toHaveBeenCalledTimes(2);
  });
});

describe("career-site custom text — workspace update action", () => {
  beforeEach(() => vi.clearAllMocks());

  const PAGE_ID = "cpageaaaaaaaaaaaaaaaaaaaa";
  const BLOCK_ID = "cblockaaaaaaaaaaaaaaaaaaa";

  it("delegates to the session-scoped custom text updater", async () => {
    updateMyCustomTextBlock.mockResolvedValue({ success: true, block: {} });
    const result = await updateCustomTextBlockAction(PAGE_ID, BLOCK_ID, {
      text: "Hello world",
    });
    expect(updateMyCustomTextBlock).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
      text: "Hello world",
    });
    expect(result.success).toBe(true);
  });

  it("passes multiline text through unchanged", async () => {
    updateMyCustomTextBlock.mockResolvedValue({ success: true, block: {} });
    await updateCustomTextBlockAction(PAGE_ID, BLOCK_ID, {
      text: "First line\nSecond line",
    });
    expect(updateMyCustomTextBlock).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
      text: "First line\nSecond line",
    });
  });

  it("passes an explicit empty string through unchanged", async () => {
    updateMyCustomTextBlock.mockResolvedValue({ success: true, block: {} });
    await updateCustomTextBlockAction(PAGE_ID, BLOCK_ID, { text: "" });
    expect(updateMyCustomTextBlock).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
      text: "",
    });
  });

  it("passes the caller input through raw so the strict domain schema stays authoritative", async () => {
    updateMyCustomTextBlock.mockResolvedValue({
      success: false,
      message: "Invalid input.",
    });
    const result = await updateCustomTextBlockAction(PAGE_ID, BLOCK_ID, {
      text: "x",
      position: 9,
      type: "HERO",
    });
    expect(updateMyCustomTextBlock).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
      text: "x",
      position: 9,
      type: "HERO",
    });
    expect(result.success).toBe(false);
  });

  it("propagates domain failure without throwing", async () => {
    updateMyCustomTextBlock.mockResolvedValue({
      success: false,
      message: "Block not found.",
    });
    const result = await updateCustomTextBlockAction(PAGE_ID, BLOCK_ID, {
      text: "x",
    });
    expect(result).toEqual({ success: false, message: "Block not found." });
  });
});

describe("career-site blocks — delete action", () => {
  beforeEach(() => vi.clearAllMocks());

  const PAGE_ID = "cpageaaaaaaaaaaaaaaaaaaaa";
  const BLOCK_ID = "cblockaaaaaaaaaaaaaaaaaaa";

  it("delegates to the session-scoped block deletion path", async () => {
    deleteMyCareerSiteBlock.mockResolvedValue({ success: true });
    const result = await deleteCareerSiteBlockAction(PAGE_ID, BLOCK_ID);
    expect(deleteMyCareerSiteBlock).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID);
    expect(deleteMyCareerSiteBlock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it("accepts only locators — no candidateId path exists on the action", async () => {
    deleteMyCareerSiteBlock.mockResolvedValue({ success: true });
    await deleteCareerSiteBlockAction(PAGE_ID, BLOCK_ID);
    // The action signature is (pageId, blockId); any caller-supplied
    // candidateId cannot reach the domain — the wrapper derives the
    // session candidate itself.
    expect(deleteMyCareerSiteBlock.mock.calls[0]).toHaveLength(2);
  });

  it("propagates domain failure without throwing", async () => {
    deleteMyCareerSiteBlock.mockResolvedValue({
      success: false,
      message: "Block not found.",
    });
    const result = await deleteCareerSiteBlockAction(PAGE_ID, BLOCK_ID);
    expect(result).toEqual({ success: false, message: "Block not found." });
  });
});
