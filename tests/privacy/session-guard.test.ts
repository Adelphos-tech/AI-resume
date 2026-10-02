import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const candidateFindUnique = vi.fn();

vi.mock("@/server/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("@/server/db", () => ({
  prisma: { candidate: { findUnique: candidateFindUnique } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), {
      digest: `NEXT_REDIRECT:${url}`,
    });
  },
  notFound: () => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), {
      digest: "NEXT_NOT_FOUND",
    });
  },
}));

const { requireCandidateSession } = await import("@/server/session");

async function expectRedirect(promise: Promise<unknown>, url: string) {
  await expect(promise).rejects.toMatchObject({
    digest: `NEXT_REDIRECT:${url}`,
  });
}

describe("requireCandidateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /candidate/login when there is no session", async () => {
    getSession.mockResolvedValue(null);
    await expectRedirect(requireCandidateSession(), "/candidate/login");
  });

  it("redirects when the session user has a non-candidate role", async () => {
    getSession.mockResolvedValue({ user: { id: "u-1", role: "admin" } });
    await expectRedirect(requireCandidateSession(), "/candidate/login");
    expect(candidateFindUnique).not.toHaveBeenCalled();
  });

  it("redirects when no candidate record matches the session user", async () => {
    getSession.mockResolvedValue({
      user: { id: "u-1", role: "CANDIDATE" },
    });
    candidateFindUnique.mockResolvedValue(null);
    await expectRedirect(requireCandidateSession(), "/candidate/login");
  });

  it("returns the session-owned candidate for a valid candidate session", async () => {
    const session = { user: { id: "u-1", role: "CANDIDATE" } };
    getSession.mockResolvedValue(session);
    candidateFindUnique.mockResolvedValue({
      id: "cand-a",
      firstName: "A",
      lastName: "One",
      email: "a@example.test",
    });
    const ctx = await requireCandidateSession();
    expect(ctx.candidate.id).toBe("cand-a");
  });
});
