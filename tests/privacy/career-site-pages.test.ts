import { beforeEach, describe, expect, it, vi } from "vitest";

const siteFindUnique = vi.fn();
const siteCreate = vi.fn();
const pageCreate = vi.fn();
const pageFindMany = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSite: { findUnique: siteFindUnique, create: siteCreate },
    careerSitePage: { create: pageCreate, findMany: pageFindMany },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const {
  createCandidateCareerSite,
  createCandidateCareerSitePage,
  listCandidateCareerSitePages,
  createMyCareerSitePage,
  listMyCareerSitePages,
} = await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbbbbbb";
const SITE_A = {
  id: "csiteaaaaaaaaaaaaaaaaaaaa",
  candidateId: CANDIDATE_A,
};
const SITE_B = {
  id: "csitebbbbbbbbbbbbbbbbbbbb",
  candidateId: CANDIDATE_B,
};
const PAGE = {
  id: "cpageaaaaaaaaaaaaaaaaaaaa",
  careerSiteId: SITE_A.id,
  title: "About",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

function sessionFor(candidateId: string) {
  requireCandidateSession.mockResolvedValue({
    session: {},
    candidate: { id: candidateId },
  });
}

describe("CareerSitePage — creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a page on the session-owned CareerSite", async () => {
    sessionFor(CANDIDATE_A);
    siteFindUnique.mockResolvedValue(SITE_A);
    pageCreate.mockResolvedValue(PAGE);
    const result = await createMyCareerSitePage({ title: "About" });
    expect(result.success).toBe(true);
    expect(pageCreate).toHaveBeenCalledWith({
      data: { careerSiteId: SITE_A.id, title: "About" },
    });
  });

  it("trims title whitespace before persisting", async () => {
    siteFindUnique.mockResolvedValue(SITE_A);
    pageCreate.mockResolvedValue(PAGE);
    const result = await createCandidateCareerSitePage(CANDIDATE_A, {
      title: "  About  ",
    });
    expect(result.success).toBe(true);
    expect(pageCreate).toHaveBeenCalledWith({
      data: { careerSiteId: SITE_A.id, title: "About" },
    });
  });

  it("rejects empty titles without touching the database", async () => {
    const result = await createCandidateCareerSitePage(CANDIDATE_A, {
      title: "   ",
    });
    expect(result.success).toBe(false);
    expect(siteFindUnique).not.toHaveBeenCalled();
  });

  it("fails cleanly when the candidate has no CareerSite", async () => {
    siteFindUnique.mockResolvedValue(null);
    const result = await createCandidateCareerSitePage(CANDIDATE_B, {
      title: "About",
    });
    expect(result.success).toBe(false);
    expect(pageCreate).not.toHaveBeenCalled();
  });

  it("rejects input carrying a browser-supplied careerSiteId", async () => {
    sessionFor(CANDIDATE_A);
    siteFindUnique.mockResolvedValue(SITE_A);
    // The strict input schema has no careerSiteId field — a caller
    // cannot influence which site owns the page.
    const result = await createMyCareerSitePage({
      title: "About",
      careerSiteId: SITE_B.id,
    });
    expect(result.success).toBe(false);
    expect(pageCreate).not.toHaveBeenCalled();
  });
});

describe("CareerSitePage — listing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns only pages from the session candidate's site", async () => {
    sessionFor(CANDIDATE_A);
    siteFindUnique.mockResolvedValue(SITE_A);
    pageFindMany.mockResolvedValue([PAGE]);
    const result = await listMyCareerSitePages();
    expect(result.success).toBe(true);
    expect(pageFindMany).toHaveBeenCalledWith({
      where: { careerSiteId: SITE_A.id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    expect(result).toMatchObject({ pages: [{ id: PAGE.id }] });
  });

  it("fails cleanly for a candidate with no CareerSite", async () => {
    siteFindUnique.mockResolvedValue(null);
    const result = await listCandidateCareerSitePages(CANDIDATE_B);
    expect(result.success).toBe(false);
    expect(pageFindMany).not.toHaveBeenCalled();
  });

  it("session candidate A cannot reach candidate B's pages", async () => {
    sessionFor(CANDIDATE_A);
    siteFindUnique.mockResolvedValue(SITE_A);
    pageFindMany.mockResolvedValue([]);
    const result = await listMyCareerSitePages();
    // The lookup is bound to A's site — B's site id never reaches the query.
    expect(pageFindMany).toHaveBeenCalledWith({
      where: { careerSiteId: SITE_A.id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    expect(result).toMatchObject({ pages: [] });
  });
});

describe("CareerSite lifecycle — no implicit pages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creating a CareerSite never creates a page", async () => {
    siteFindUnique.mockResolvedValue(null);
    siteCreate.mockResolvedValue(SITE_A);
    const result = await createCandidateCareerSite(CANDIDATE_A);
    expect(result.success).toBe(true);
    expect(siteCreate).toHaveBeenCalledWith({
      data: { candidateId: CANDIDATE_A },
    });
    expect(pageCreate).not.toHaveBeenCalled();
    expect(pageFindMany).not.toHaveBeenCalled();
  });
});
