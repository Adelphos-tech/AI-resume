import { beforeEach, describe, expect, it, vi } from "vitest";

const createMyCareerSite = vi.fn();
const getMyCareerSite = vi.fn();

vi.mock("@/server/career-site/career-site", () => ({
  createMyCareerSite,
  getMyCareerSite,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createCareerSiteAction } =
  await import("@/app/candidate/(workspace)/career-site/actions");
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
  });

  it("does not create a site when one already exists on render", async () => {
    getMyCareerSite.mockResolvedValue({ success: true, careerSite: SITE });
    await CandidateCareerSitePage();
    expect(createMyCareerSite).not.toHaveBeenCalled();
  });
});
