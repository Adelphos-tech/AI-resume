import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import { authSchemaOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { env } from "@/server/env";

// Server-only Better Auth instance used exclusively for the
// candidate-registration boundary. It is never mounted on an HTTP
// route — the public /api/auth handler still uses `auth`, where
// sign-up remains disabled.
export const candidateSignupAuth = betterAuth({
  ...authSchemaOptions,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  databaseHooks: {
    user: {
      create: {
        // CANDIDATE is written on the initial INSERT — the user is
        // never STAFF or ADMIN at any point in its lifecycle. Browser
        // input still cannot influence this (role is input:false).
        before: async (user) => ({
          data: { ...user, role: "CANDIDATE" },
        }),
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
