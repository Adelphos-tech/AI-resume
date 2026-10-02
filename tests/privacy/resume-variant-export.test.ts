import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCandidateSession = vi.fn();
const getResumeVariantCore = vi.fn();
const generateResumePdf = vi.fn();

vi.mock("@/server/session", () => ({ requireCandidateSession }));
vi.mock("@/server/resume-variants/resume-variants", () => ({
  getResumeVariantCore,
}));
vi.mock("@/server/resume-variants/pdf", () => ({ generateResumePdf }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "better-auth.session_token"
        ? { name, value: "test-token" }
        : undefined,
  }),
}));

const { GET } =
  await import("@/app/candidate/(workspace)/resumes/[variantId]/pdf/route");

function req(variantId: string) {
  return { params: Promise.resolve({ variantId }) };
}

function variantRow(candidateId: string) {
  return {
    success: true as const,
    variant: {
      candidateId,
      templateKey: "classic",
      name: "Variant",
      resumeData: {},
    },
  };
}

describe("candidate resume PDF export — ownership boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCandidateSession.mockResolvedValue({
      session: {},
      candidate: { id: "cand-a" },
    });
  });

  it("returns 404 and never renders a PDF for a variant owned by another candidate", async () => {
    getResumeVariantCore.mockResolvedValue(variantRow("cand-b"));
    const res = await GET(
      new Request("http://localhost/x"),
      req("cvarbbbbbbbbbbbbbbbbbbbb") as never,
    );
    expect(res.status).toBe(404);
    expect(generateResumePdf).not.toHaveBeenCalled();
  });

  it("returns 404 and never renders a PDF for a missing variant", async () => {
    getResumeVariantCore.mockResolvedValue({
      success: false,
      message: "not found",
    });
    const res = await GET(
      new Request("http://localhost/x"),
      req("cvarxxxxxxxxxxxxxxxxxxxxxxxx") as never,
    );
    expect(res.status).toBe(404);
    expect(generateResumePdf).not.toHaveBeenCalled();
  });

  it("renders a PDF for a variant owned by the session candidate", async () => {
    getResumeVariantCore.mockResolvedValue(variantRow("cand-a"));
    generateResumePdf.mockResolvedValue(Buffer.from("%PDF-test"));
    const res = await GET(
      new Request("http://localhost/x"),
      req("cvaraaaaaaaaaaaaaaaaaaaaaaaa") as never,
    );
    expect(generateResumePdf).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/pdf");
  });
});
