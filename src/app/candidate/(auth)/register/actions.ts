"use server";

import { z } from "zod";

import { candidateSignupAuth } from "@/server/candidate-auth";
import { prisma } from "@/server/db";

const registerSchema = z
  .strictObject({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.email().trim().toLowerCase().max(320),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterResult = { success: true } | { success: false; message: string };

export async function registerCandidateAction(
  input: unknown,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check your details.",
    };
  }

  const { firstName, lastName, email, password } = parsed.data;

  let userId: string;
  try {
    const res = await candidateSignupAuth.api.signUpEmail({
      body: {
        name: `${firstName} ${lastName}`,
        email,
        password,
      },
    });
    userId = res.user.id;
  } catch {
    // Covers duplicate email and provider validation without
    // revealing whether a privileged/internal account exists.
    return {
      success: false,
      message: "Unable to create an account with these details.",
    };
  }

  try {
    // Role was already pinned to CANDIDATE at user INSERT by the
    // databaseHooks.user.create.before hook on candidateSignupAuth.
    await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        package: "STARTER_LAP",
        status: "NEW",
        userId,
      },
    });
  } catch {
    // Compensating cleanup: never leave an auth identity that could
    // resolve as a candidate without ownership. Deleting the user
    // cascades its session/account rows.
    await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    return {
      success: false,
      message: "Unable to create an account with these details.",
    };
  }

  // The caller signs in through the normal auth endpoint after this
  // action succeeds — no manual cookie forwarding needed.
  return { success: true };
}
