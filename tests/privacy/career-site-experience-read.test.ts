import { beforeEach, describe, expect, it, vi } from "vitest";

const pageFindUnique = vi.fn();
const blockFindUnique = vi.fn();
const requireCandidateSession = vi.fn();
const getMasterCareerProfileCore = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: { findUnique: blockFindUnique },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

vi.mock("@/server/career-profile/master-career-profile", () => ({
  getMasterCareerProfileCore,
}));

const { getCandidateExperienceBlockData } =
  await import("@/server/career-site/career-site");

function assertSuccess(result: {
  success: boolean;
  data?: unknown;
  message?: string;
}): {
  entries: Array<{
    company: string;
    position: string;
    location: string | null;
    employmentType: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    summary: string | null;
    highlights: string[];
  }>;
} {
  if (!result.success) {
    throw new Error(`Expected success, got: ${result.message}`);
  }
  return result.data as {
    entries: Array<{
      company: string;
      position: string;
      location: string | null;
      employmentType: string | null;
      startDate: string | null;
      endDate: string | null;
      isCurrent: boolean;
      summary: string | null;
      highlights: string[];
    }>;
  };
}

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const PAGE_A = "cpageaaaaaaaaaaaaaaaaaaaa";
const BLOCK_A = "cblockaaaaaaaaaaaaaaaaaaa";

function experienceBlockRow(candidateId: string) {
  return {
    id: BLOCK_A,
    careerSitePageId: PAGE_A,
    type: "EXPERIENCE",
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

describe("EXPERIENCE canonical read — domain reuse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns work entries from MCP for owned EXPERIENCE block", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(experienceBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Jane Doe", headline: "Senior Engineer" },
        work: [
          {
            id: "w1",
            company: "Acme Corp",
            position: "Senior Engineer",
            location: "San Francisco, CA",
            employmentType: "Full-time",
            startDate: "2020-03",
            endDate: null,
            isCurrent: true,
            summary: "Building scalable systems.",
            highlights: ["Led team of 5", "Shipped v2.0"],
          },
          {
            id: "w2",
            company: "Beta Inc",
            position: "Engineer",
            location: "Remote",
            employmentType: "Contract",
            startDate: "2018-01",
            endDate: "2020-02",
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data.entries).toHaveLength(2);
    expect(data.entries[0]).toMatchObject({
      company: "Acme Corp",
      position: "Senior Engineer",
      location: "San Francisco, CA",
      employmentType: "Full-time",
      startDate: "2020-03",
      endDate: null,
      isCurrent: true,
      summary: "Building scalable systems.",
      highlights: ["Led team of 5", "Shipped v2.0"],
    });
    expect(data.entries[1]).toMatchObject({
      company: "Beta Inc",
      position: "Engineer",
      location: "Remote",
      employmentType: "Contract",
      startDate: "2018-01",
      endDate: "2020-02",
      isCurrent: false,
      summary: null,
      highlights: [],
    });
  });

  it("returns empty entries array when MCP work is empty", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(experienceBlockRow(CANDIDATE_A));
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

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data.entries).toEqual([]);
  });

  it("does NOT expose candidateId, careerSiteId, pageId, or blockId in DTO", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(experienceBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: true,
      profile: {
        basics: { fullName: "Jane Doe", headline: null },
        work: [
          {
            id: "w1",
            company: "Acme Corp",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: true,
            summary: null,
            highlights: [],
          },
        ],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      },
      schemaVersion: 1,
      updatedAt: new Date(),
    });

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data).toHaveProperty("entries");
    expect(data).not.toHaveProperty("candidateId");
    expect(data).not.toHaveProperty("careerSiteId");
    expect(data).not.toHaveProperty("pageId");
    expect(data).not.toHaveProperty("blockId");
  });

  it("rejects a non-EXPERIENCE block with safe not-found", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi.fn().mockResolvedValue({
      ...experienceBlockRow(CANDIDATE_A),
      type: "HERO",
    });

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("rejects a block owned by another candidate", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(experienceBlockRow("ccbbbbbbbbbbbbbbbbbbbbbbbb"));

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, message: "Block not found." });
  });

  it("returns safe not-found when MCP is missing", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    const prisma = (await import("@/server/db")).prisma;
    prisma.careerSiteBlock.findUnique = vi
      .fn()
      .mockResolvedValue(experienceBlockRow(CANDIDATE_A));
    getMasterCareerProfileCore.mockResolvedValue({
      success: false,
      message: "Profile not found.",
    });

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, message: "Block not found." });
  });
});
