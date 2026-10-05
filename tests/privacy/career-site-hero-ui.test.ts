import { beforeEach, describe, expect, it, vi } from "vitest";

const pageFindUnique = vi.fn();
const blockFindMany = vi.fn();
const requireCandidateSession = vi.fn();
const getMasterCareerProfileCore = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: { findMany: blockFindMany },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

vi.mock("@/server/career-profile/master-career-profile", () => ({
  getMasterCareerProfileCore,
}));

const { getCandidateHeroBlockData } =
  await import("@/server/career-site/career-site");

function assertSuccess(result: {
  success: boolean;
  data?: unknown;
  message?: string;
}): {
  displayName: string;
  headline: string | null;
} {
  if (!result.success) {
    throw new Error(`Expected success, got: ${result.message}`);
  }
  return result.data as {
    displayName: string;
    headline: string | null;
  };
}

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const BLOCK_A = "cblockaaaaaaaaaaaaaaaaaaa";

function heroBlockRow(candidateId: string) {
  return {
    id: BLOCK_A,
    careerSitePageId: PAGE_A,
    type: "HERO",
    position: 0,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    page: {
      careerSite: {
        candidateId,
        candidate: {
          firstName: "Jane",
          lastName: "Doe",
        },
      },
    },
  };
}

describe("HERO canonical presentation — domain reuse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns displayName and headline from MCP for owned HERO block", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Jane Architect", headline: "Senior Engineer" },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data).toEqual({
      displayName: "Jane Architect",
      headline: "Senior Engineer",
    });
  });

  it("returns displayName from Candidate fallback when MCP fullName is null", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: null, headline: "Engineer" },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data.displayName).toBe("Jane Doe");
  });

  it("returns null headline when MCP headline is null", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Jane Doe", headline: null },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data.headline).toBeNull();
  });

  it("does NOT expose candidateId, careerSiteId, pageId, or blockId in DTO", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Jane Doe", headline: "Engineer" },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data).toHaveProperty("displayName");
    expect(data).toHaveProperty("headline");
    expect(data).not.toHaveProperty("candidateId");
    expect(data).not.toHaveProperty("careerSiteId");
    expect(data).not.toHaveProperty("pageId");
    expect(data).not.toHaveProperty("blockId");
  });
});

describe("HERO canonical presentation — UI component", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders displayName and headline when hero data is present", async () => {
    const { HeroBlock } =
      await import("@/components/candidate/career-site/hero-block");
    const element = HeroBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: { displayName: "Jane Architect", headline: "Senior Engineer" },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    expect(element).toBeDefined();
    const text = extractText(element);
    expect(text).toContain("Jane Architect");
    expect(text).toContain("Senior Engineer");
    expect(text).toContain("Hero");
    expect(text).toContain("Block 1");
  });

  it("renders displayName without fake headline when headline is null", async () => {
    const { HeroBlock } =
      await import("@/components/candidate/career-site/hero-block");
    const element = HeroBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: { displayName: "Jane Doe", headline: null },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Jane Doe");
    expect(text).not.toContain("Professional");
    expect(text).not.toContain("Your headline");
    expect(text).not.toContain("Career professional");
  });

  it("renders label-only fallback when canonical data is unavailable", async () => {
    const { HeroBlock } =
      await import("@/components/candidate/career-site/hero-block");
    const element = HeroBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: undefined,
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Hero");
    expect(text).toContain("Block 1");
    expect(text).not.toContain("Jane");
  });

  it("does not render an Edit control", async () => {
    const { HeroBlock } =
      await import("@/components/candidate/career-site/hero-block");
    const element = HeroBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: { displayName: "Jane Doe", headline: "Engineer" },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("Edit");
    expect(text).not.toContain("Save");
    expect(text).not.toContain("Cancel");
  });
});

function extractText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (
    typeof node === "object" &&
    node !== null &&
    "props" in node &&
    (node as { props?: { children?: unknown } }).props?.children
  ) {
    return extractText(
      (node as { props?: { children?: unknown } }).props!.children,
    );
  }
  return "";
}
