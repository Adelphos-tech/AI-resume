import type { BetterAuthOptions } from "better-auth";

// Shared auth schema/options. This module intentionally has no
// `server-only` import and no secret-bearing dependencies so it can be
// loaded by both the server auth instance and the Better Auth CLI
// (schema generation) entrypoint.
export const authSchemaOptions = {
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STAFF",
        input: false,
      },
    },
  },
} satisfies BetterAuthOptions;
