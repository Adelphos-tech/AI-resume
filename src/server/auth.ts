import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import { authSchemaOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { env } from "@/server/env";

export const auth = betterAuth({
  ...authSchemaOptions,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
