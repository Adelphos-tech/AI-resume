import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: { publicProfileLink: { findUnique } },
}));

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

const { GET } = await import("@/app/n/[token]/route");

function req(token: string) {
  return { params: Promise.resolve({ token }) };
}

async function outcome(token: string) {
  try {
    await GET(new Request("http://localhost/n/x"), req(token) as never);
    return "no-op";
  } catch (e) {
    const digest = (e as { digest?: string }).digest ?? "";
    if (digest === "NEXT_NOT_FOUND") return "not-found";
    if (digest.startsWith("NEXT_REDIRECT:")) return digest.slice(14);
    throw e;
  }
}

describe("/n/<token> permanent share link", () => {
  beforeEach(() => findUnique.mockReset());

  it("redirects an active token on a published profile to /u/<slug>", async () => {
    findUnique.mockResolvedValue({
      isActive: true,
      publicProfile: { slug: "candidate-a", isPublished: true },
    });
    expect(await outcome("tok-a")).toBe("/u/candidate-a");
  });

  it("returns not-found when the profile is unpublished even with a valid token", async () => {
    findUnique.mockResolvedValue({
      isActive: true,
      publicProfile: { slug: "candidate-a", isPublished: false },
    });
    expect(await outcome("tok-a")).toBe("not-found");
  });

  it("returns not-found for an unknown token", async () => {
    findUnique.mockResolvedValue(null);
    expect(await outcome("tok-unknown")).toBe("not-found");
  });

  it("returns not-found for an inactive link", async () => {
    findUnique.mockResolvedValue({
      isActive: false,
      publicProfile: { slug: "candidate-a", isPublished: true },
    });
    expect(await outcome("tok-a")).toBe("not-found");
  });
});
