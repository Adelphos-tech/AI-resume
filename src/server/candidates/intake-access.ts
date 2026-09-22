import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import type { CandidatePackage } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import { requireInternalSession } from "@/server/session";

export const INTAKE_LINK_TTL_DAYS = 14;

const candidateIdSchema = z.cuid();

// 32 random bytes encoded as base64url → exactly 43 chars of [A-Za-z0-9_-].
const intakeTokenSchema = z
  .string()
  .length(43)
  .regex(/^[A-Za-z0-9_-]{43}$/);

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type GenerateIntakeAccessResult =
  { success: true; token: string } | { success: false; message: string };

export async function generateCandidateIntakeAccess(
  candidateId: string,
): Promise<GenerateIntakeAccessResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: parsedId.data },
    select: { id: true },
  });
  if (!candidate) {
    return { success: false, message: "Candidate not found." };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + INTAKE_LINK_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.candidateIntakeAccess.upsert({
    where: { candidateId: parsedId.data },
    create: {
      candidateId: parsedId.data,
      tokenHash: hashToken(token),
      expiresAt,
    },
    update: {
      tokenHash: hashToken(token),
      expiresAt,
      revokedAt: null,
    },
  });

  return { success: true, token };
}

export type RevokeIntakeAccessResult =
  { success: true } | { success: false; message: string };

export async function revokeCandidateIntakeAccess(
  candidateId: string,
): Promise<RevokeIntakeAccessResult> {
  await requireInternalSession();

  const parsedId = candidateIdSchema.safeParse(candidateId);
  if (!parsedId.success) {
    return { success: false, message: "Candidate not found." };
  }

  try {
    await prisma.candidateIntakeAccess.update({
      where: { candidateId: parsedId.data },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  } catch {
    return { success: false, message: "No intake link exists." };
  }
}

export type ResolvedIntakeToken = {
  firstName: string;
  package: CandidatePackage;
};

export async function resolveCandidateIntakeToken(
  token: string,
): Promise<ResolvedIntakeToken | null> {
  const parsedToken = intakeTokenSchema.safeParse(token);
  if (!parsedToken.success) {
    return null;
  }

  const access = await prisma.candidateIntakeAccess.findUnique({
    where: { tokenHash: hashToken(parsedToken.data) },
    select: {
      expiresAt: true,
      revokedAt: true,
      candidate: { select: { firstName: true, package: true } },
    },
  });

  if (!access || access.revokedAt || access.expiresAt <= new Date()) {
    return null;
  }

  return {
    firstName: access.candidate.firstName,
    package: access.candidate.package,
  };
}
