import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";

const INTERNAL_ROLES = new Set(["ADMIN", "STAFF"]);

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
