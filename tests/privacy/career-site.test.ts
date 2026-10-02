import { Prisma } from "@/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: { careerSite: { findUnique, create } },
}));

vi.mock("@/server/session", () => ({ requireCandidateSession }));

const {
  getCandidateCareerSite,
  createCandidateCareerSite,
  getMyCareerSite,
  createMyCareerSite,
} = await import("@/server/career-site/career-site");

const CANDIDATE_A = "ccaaaaaaaaaaaaaaaaaaaaaaaa";
const SITE_A = {
  id: "csiteaaaaaaaaaaaaaaaaaaaa",
  candidateId: CANDIDATE_A,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("CareerSite — explicit creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a site for the session-owned candidate id", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue(SITE_A);
    const result = await createCandidateCareerSite(CANDIDATE_A);
    expect(result.success).toBe(true);
    expect(create).toHaveBeenCalledWith({
      data: { candidateId: CANDIDATE_A },
    });
  });

  it("returns the existing site instead of creating a duplicate", async () => {
    findUnique.mockResolvedValue(SITE_A);
    const result = await createCandidateCareerSite(CANDIDATE_A);
    expect(result.success).toBe(true);
    expect(result).toMatchObject({
      careerSite: { id: SITE_A.id },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("returns the raced site when create hits the unique constraint", async () => {
    findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(SITE_A);
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique violation", {
        code: "P2002",
        clientVersion: "7.10.0",
      }),
    );
    const result = await createCandidateCareerSite(CANDIDATE_A);
    expect(result.success).toBe(true);
    expect(result).toMatchObject({ careerSite: { id: SITE_A.id } });
  });
});

describe("CareerSite — retrieval scoping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries by candidateId, not an arbitrary site id", async () => {
    findUnique.mockResolvedValue(SITE_A);
    const result = await getCandidateCareerSite(CANDIDATE_A);
    expect(findUnique).toHaveBeenCalledWith({
      where: { candidateId: CANDIDATE_A },
    });
    expect(result).toMatchObject({ careerSite: { id: SITE_A.id } });
  });

  it("returns not-found for a candidate with no site", async () => {
    findUnique.mockResolvedValue(null);
    const result = await getCandidateCareerSite(CANDIDATE_A);
    expect(result.success).toBe(false);
  });

  it("rejects malformed candidate ids without touching the database", async () => {
    const result = await getCandidateCareerSite("not-a-cuid");
    expect(result.success).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe("CareerSite — session boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the session-owned candidate id, never browser input", async () => {
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue(SITE_A);
    await createMyCareerSite();
    expect(create).toHaveBeenCalledWith({
      data: { candidateId: CANDIDATE_A },
    });
  });

  it("propagates session rejection before any site lookup", async () => {
    requireCandidateSession.mockRejectedValue(
      Object.assign(new Error("NEXT_REDIRECT"), {
        digest: "NEXT_REDIRECT:/candidate/login",
      }),
    );
    await expect(getMyCareerSite()).rejects.toMatchObject({
      digest: "NEXT_REDIRECT:/candidate/login",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });
});
