import { beforeEach, describe, expect, it, vi } from "vitest";

const blockFindUnique = vi.fn();
const requireCandidateSession = vi.fn();
const getMasterCareerProfileCore = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSiteBlock: { findUnique: blockFindUnique },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

vi.mock("@/server/career-profile/master-career-profile", () => ({
  getMasterCareerProfileCore,
}));

const { getCandidateHeroBlockData, getMyHeroBlockData } =
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
const CANDIDATE_B = "ccbbbbbbbbbbbbbbbbbbbb";
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

function customTextBlockRow(candidateId: string) {
  return {
    ...heroBlockRow(candidateId),
    type: "CUSTOM_TEXT",
  };
}

describe("HeroBlockData — canonical read", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves displayName from MCP fullName when present", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
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
    expect(data.displayName).toBe("Jane Architect");
    expect(data.headline).toBe("Senior Engineer");
  });

  it("falls back to Candidate firstName + lastName when MCP fullName is null", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
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
    expect(data.headline).toBe("Engineer");
  });

  it("returns null headline when MCP headline is null", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
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
    expect(data.headline).toBe(null);
  });

  it("does NOT use CareerSiteBlock.content as the identity source", async () => {
    blockFindUnique.mockResolvedValue({
      ...heroBlockRow(CANDIDATE_A),
      content: { fake: "data" },
    });
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Real Name", headline: "Real Headline" },
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
    expect(data.displayName).toBe("Real Name");
    expect(data.headline).toBe("Real Headline");
  });

  it("reflects canonical headline changes without touching the block row", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore
      .mockResolvedValueOnce({
        success: true,
        profile: {
          basics: { fullName: "Jane Doe", headline: "Old Headline" },
          work: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
        },
        schemaVersion: 1,
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        success: true,
        profile: {
          basics: { fullName: "Jane Doe", headline: "New Headline" },
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
    const first = await getCandidateHeroBlockData(CANDIDATE_A, PAGE_A, BLOCK_A);
    const firstData = assertSuccess(first);
    expect(firstData.headline).toBe("Old Headline");
    const second = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const secondData = assertSuccess(second);
    expect(secondData.headline).toBe("New Headline");
    expect(blockFindUnique).toHaveBeenCalledTimes(2);
  });

  it("rejects CUSTOM_TEXT block type as not found", async () => {
    blockFindUnique.mockResolvedValue(customTextBlockRow(CANDIDATE_A));
    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(getMasterCareerProfileCore).not.toHaveBeenCalled();
  });

  it("rejects foreign Candidate HERO block", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_B));
    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(getMasterCareerProfileCore).not.toHaveBeenCalled();
  });

  it("rejects wrong-page HERO block", async () => {
    blockFindUnique.mockResolvedValue({
      ...heroBlockRow(CANDIDATE_A),
      careerSitePageId: "other-page",
    });
    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(getMasterCareerProfileCore).not.toHaveBeenCalled();
  });

  it("returns not found when block does not exist", async () => {
    blockFindUnique.mockResolvedValue(null);
    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
    expect(getMasterCareerProfileCore).not.toHaveBeenCalled();
  });

  it("returns not found when MCP does not exist", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: null,
      schemaVersion: null,
      updatedAt: null,
    });
    const result = await getCandidateHeroBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("session wrapper derives candidate from requireCandidateSession", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
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
    const result = await getMyHeroBlockData(PAGE_A, BLOCK_A);
    assertSuccess(result);
    expect(getMasterCareerProfileCore).toHaveBeenCalledWith(CANDIDATE_A);
  });

  it("does NOT expose candidateId, careerSiteId, pageId, or blockId in DTO", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
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
    expect(data).toEqual({
      displayName: "Jane Doe",
      headline: "Engineer",
    });
    expect(data).not.toHaveProperty("candidateId");
    expect(data).not.toHaveProperty("careerSiteId");
    expect(data).not.toHaveProperty("pageId");
    expect(data).not.toHaveProperty("blockId");
  });

  it("does NOT expose MCP raw profileData or other private fields", async () => {
    blockFindUnique.mockResolvedValue(heroBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: {
          fullName: "Jane Doe",
          headline: "Engineer",
          email: "jane@example.com",
          phone: "+1234567890",
        },
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
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("phone");
    expect(data).not.toHaveProperty("work");
    expect(data).not.toHaveProperty("profileData");
  });
});
