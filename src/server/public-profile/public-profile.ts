import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/server/db";
import { requireCandidateSession } from "@/server/session";

/** Top-level paths that must never be claimable as a public slug. */
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "candidate",
  "intake",
  "login",
  "logout",
  "print",
  "register",
  "u",
  "n",
  "health",
  "settings",
  "help",
  "_next",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;

export const publicProfileSchema = {
  slug: {
    min: 2,
    max: 48,
  },
};

export type PublicProfileResult =
  { success: true } | { success: false; message: string };

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** 192-bit opaque share token — no relation to candidate/profile ids. */
function generateLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function getCandidatePublicProfile() {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
    include: { links: true },
  });
  return { candidate, profile };
}

/**
 * Atomically creates the candidate's PublicProfile + one permanent
 * PublicProfileLink. `candidateId` and `publicProfileId` uniqueness are
 * the final authority — a concurrent create returns the existing rows.
 */
export async function createPublicProfile(): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();

  const existing = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (existing) return { success: true };

  const base =
    slugify(`${candidate.firstName} ${candidate.lastName}`) || "profile";
  const preferred = RESERVED_SLUGS.has(base) ? `${base}-x` : base;

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? preferred : `${preferred}-${attempt + 1}`;
    try {
      await prisma.$transaction(async (tx) => {
        const profile = await tx.publicProfile.create({
          data: { candidateId: candidate.id, slug },
        });
        await tx.publicProfileLink.create({
          data: {
            publicProfileId: profile.id,
            token: generateLinkToken(),
          },
        });
      });
      return { success: true };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        // Slug/token collision — retry; candidateId collision means a
        // concurrent create already succeeded.
        const after = await prisma.publicProfile.findUnique({
          where: { candidateId: candidate.id },
        });
        if (after) return { success: true };
        continue;
      }
      throw e;
    }
  }
  return {
    success: false,
    message: "We couldn't create your public profile. Please try again.",
  };
}

export async function updatePublicProfileSlug(
  rawSlug: unknown,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const parsed =
    typeof rawSlug === "string" ? rawSlug.trim().toLowerCase() : "";

  if (!isValidSlug(parsed)) {
    return {
      success: false,
      message:
        "Use 2–48 lowercase letters, numbers, or hyphens — no spaces, no leading/trailing hyphen, and not a reserved word.",
    };
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }

  try {
    await prisma.publicProfile.update({
      where: { id: profile.id },
      data: { slug: parsed },
    });
    return { success: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "That address is already taken. Try a different one.",
      };
    }
    throw e;
  }
}

export async function setPublicProfilePublished(
  isPublished: boolean,
): Promise<PublicProfileResult> {
  const { candidate } = await requireCandidateSession();
  const profile = await prisma.publicProfile.findUnique({
    where: { candidateId: candidate.id },
  });
  if (!profile) {
    return { success: false, message: "Create your public profile first." };
  }
  await prisma.publicProfile.update({
    where: { id: profile.id },
    data: { isPublished },
  });
  return { success: true };
}
