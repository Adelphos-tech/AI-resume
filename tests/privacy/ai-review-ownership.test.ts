import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const groqCreate = vi.fn();
const requireCandidateSession = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: { resumeVariant: { findUnique } },
}));

vi.mock("@/server/session", () => ({
  requireCandidateSession,
}));

vi.mock("@/server/ai/groq-client", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/server/ai/groq-client")>();
  return {
    ...orig,
    getGroqClient: () => ({ chat: { completions: { create: groqCreate } } }),
    getGroqModel: () => "test-model",
  };
});

const { candidateReviewResumeAction } =
  await import("@/app/candidate/(workspace)/ai-review/actions");

const CANDIDATE_A = "cand-a";
const VARIANT_B = "cvarbbbbbbbbbbbbbbbbbbbb";

const VALID_RESUME_DATA = {
  basics: {
    fullName: "Candidate Beta",
    headline: "Engineer",
    email: null,
    phone: null,
    location: null,
    links: [],
  },
  summary: { id: "basics:summary", text: "Synthetic summary text." },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  sectionOrder: [
    "summary",
    "experience",
    "skills",
    "education",
    "projects",
    "certifications",
    "languages",
  ],
};

const VALID_REVIEW = JSON.stringify({
  schemaVersion: 1,
  overall: { status: "good_foundation", summary: "Synthetic review." },
  findings: [],
  gaps: [],
});

describe("candidateReviewResumeAction — ownership boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: CANDIDATE_A },
    });
  });

  it("rejects a variant owned by another candidate before Groq is called", async () => {
    findUnique.mockResolvedValue({
      candidateId: "cand-b",
      targetRole: "Engineer",
      targetCountry: "US",
      resumeData: VALID_RESUME_DATA,
    });
    const result = await candidateReviewResumeAction({
      variantId: VARIANT_B,
    });
    expect(result.success).toBe(false);
    expect(result).not.toHaveProperty("review");
    expect(groqCreate).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent variant before Groq is called", async () => {
    findUnique.mockResolvedValue(null);
    const result = await candidateReviewResumeAction({
      variantId: VARIANT_B,
    });
    expect(result.success).toBe(false);
    expect(groqCreate).not.toHaveBeenCalled();
  });

  it("proceeds to review a variant owned by the session candidate", async () => {
    findUnique.mockResolvedValue({
      candidateId: CANDIDATE_A,
      targetRole: "Engineer",
      targetCountry: "US",
      resumeData: VALID_RESUME_DATA,
    });
    groqCreate.mockResolvedValue({
      choices: [{ message: { content: VALID_REVIEW } }],
    });
    const result = await candidateReviewResumeAction({
      variantId: VARIANT_B,
    });
    expect(groqCreate).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
