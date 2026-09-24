"use server";

import { headers } from "next/headers";

import { auth } from "@/server/auth";
import { getCandidateSession } from "@/server/session";

// Called by the candidate login form after email/password sign-in.
// Returns true only when the session belongs to a CANDIDATE with a
// resolvable owned Candidate record.
export async function verifyCandidateSessionAction(): Promise<boolean> {
  return (await getCandidateSession()) !== null;
}

export async function candidateSignOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
}
