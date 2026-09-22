"use server";

import { redirect } from "next/navigation";

import type { CreateCandidateInput } from "@/lib/candidate-schemas";
import { createCandidate } from "@/server/candidates/create-candidate";

export async function createCandidateAction(input: CreateCandidateInput) {
  const result = await createCandidate(input);

  if (result.success) {
    redirect(`/admin/candidates/${result.candidateId}`);
  }

  return result;
}
