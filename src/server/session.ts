import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

const INTERNAL_ROLES = new Set(["ADMIN", "STAFF"]);
const CANDIDATE_ROLE = "CANDIDATE";

export async function getInternalSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !INTERNAL_ROLES.has(session.user.role ?? "")) {
    return null;
  }

  return session;
}

export async function requireInternalSession() {
  const session = await getInternalSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getCandidateSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== CANDIDATE_ROLE) {
    return null;
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  if (!candidate) {
    return null;
  }

  return { session, candidate };
}

export async function requireCandidateSession() {
  const context = await getCandidateSession();

  if (!context) {
    redirect("/candidate/login");
  }

  return context;
}
