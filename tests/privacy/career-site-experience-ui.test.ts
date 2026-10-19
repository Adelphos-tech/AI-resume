import { beforeEach, describe, expect, it, vi } from "vitest";

const pageFindUnique = vi.fn();
const blockFindMany = vi.fn();
const blockFindUnique = vi.fn();
const requireCandidateSession = vi.fn();
const getMasterCareerProfileCore = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    careerSitePage: { findUnique: pageFindUnique },
    careerSiteBlock: { findMany: blockFindMany, findUnique: blockFindUnique },
  },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

vi.mock("@/server/career-profile/master-career-profile", () => ({
  getMasterCareerProfileCore,
}));

const { getCandidateExperienceBlockData } =
  await import("@/server/career-site/career-site");

const { ExperienceBlock } =
  await import("@/components/candidate/career-site/experience-block");

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

function buildMcpProfile(work: unknown[]) {
  return {
    success: true,
    profile: {
      basics: { fullName: "Jane Doe", headline: null },
      work,
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    },
    schemaVersion: 1,
    updatedAt: new Date(),
  };
}

describe("EXPERIENCE canonical presentation — domain reuse", () => {
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
    getMasterCareerProfileCore.mockResolvedValue(
      buildMcpProfile([
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
      ]),
    );

    const result = await getCandidateExperienceBlockData(
      CANDIDATE_A,
      PAGE_A,
      BLOCK_A,
    );
    const data = assertSuccess(result);
    expect(data.entries).toHaveLength(1);
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
  });
});

describe("EXPERIENCE canonical presentation — UI component", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders position and company dynamically", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme Corp",
            position: "Senior Engineer",
            location: "San Francisco, CA",
            employmentType: "Full-time",
            startDate: "2020-03",
            endDate: null,
            isCurrent: true,
            summary: "Building scalable systems.",
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Senior Engineer");
    expect(text).toContain("Acme Corp");
    expect(text).toContain("Experience");
    expect(text).toContain("Block 1");
  });

  it("renders location when present", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: "Remote",
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Remote");
  });

  it("omits location when absent", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Engineer");
    expect(text).not.toContain("Remote");
    expect(text).not.toContain("null");
    expect(text).not.toContain("undefined");
  });

  it("renders employmentType when present", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: "Contract",
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Contract");
  });

  it("omits employmentType when absent", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("Contract");
    expect(text).not.toContain("Full-time");
    expect(text).not.toContain("null");
  });

  it("renders date range truthfully", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: "2020-03",
            endDate: "2022-06",
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Mar 2020");
    expect(text).toContain("Jun 2022");
  });

  it("handles current role with Present", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: "2020-03",
            endDate: null,
            isCurrent: true,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Mar 2020");
    expect(text).toContain("Present");
  });

  it("does not fabricate date range when dates are missing", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Engineer");
    expect(text).not.toContain("Present");
    expect(text).not.toContain("2020");
    expect(text).not.toContain("null");
  });

  it("renders summary when present", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: "Led the platform team.",
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Led the platform team.");
  });

  it("omits summary when absent", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("Led");
    expect(text).not.toContain("null");
  });

  it("renders highlights dynamically", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: ["Shipped v2", "Improved perf by 40%"],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Shipped v2");
    expect(text).toContain("Improved perf by 40%");
  });

  it("collapses highlights when empty", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("Shipped");
  });

  it("renders multiple experience entries", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Senior Engineer",
            location: null,
            employmentType: null,
            startDate: "2020-01",
            endDate: null,
            isCurrent: true,
            summary: null,
            highlights: [],
          },
          {
            company: "Beta Inc",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: "2018-01",
            endDate: "2019-12",
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Senior Engineer");
    expect(text).toContain("Acme");
    expect(text).toContain("Engineer");
    expect(text).toContain("Beta Inc");
  });

  it("shows private empty state when entries array is empty", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: { entries: [] },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("No work experience added yet.");
    expect(text).not.toContain("Acme");
  });

  it("does not render private email or phone", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("@");
    expect(text).not.toContain("mailto:");
    expect(text).not.toContain("+65");
    expect(text).not.toContain("tel:");
  });

  it("does not expose raw IDs in rendered text", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain(PAGE_A);
    expect(text).not.toContain(BLOCK_A);
    expect(text).not.toContain(CANDIDATE_A);
  });

  it("does not render an Edit control", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: {
        entries: [
          {
            company: "Acme",
            position: "Engineer",
            location: null,
            employmentType: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            summary: null,
            highlights: [],
          },
        ],
      },
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).not.toContain("Edit");
    expect(text).not.toContain("Save");
    expect(text).not.toContain("Cancel");
  });

  it("shows fallback label when canonical data is unavailable", () => {
    const element = ExperienceBlock({
      pageId: PAGE_A,
      blockId: BLOCK_A,
      data: undefined,
      orderIds: [BLOCK_A],
      orderIndex: 0,
      ordinal: "Block 1",
    });
    const text = extractText(element);
    expect(text).toContain("Experience");
    expect(text).toContain("Block 1");
    expect(text).not.toContain("Acme");
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
