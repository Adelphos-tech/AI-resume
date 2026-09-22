"use server";

import {
  saveCandidateIntake,
  submitCandidateIntake,
} from "@/server/candidates/intake";

export async function saveIntakeAction(token: string, input: unknown) {
  return saveCandidateIntake(token, input);
}

export async function submitIntakeAction(token: string, input: unknown) {
  return submitCandidateIntake(token, input);
}
