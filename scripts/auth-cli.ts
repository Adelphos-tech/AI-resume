import { betterAuth } from "better-auth";

import { authSchemaOptions } from "@/server/auth-options";

// CLI-safe auth configuration used only by `pnpm auth:generate`.
// Kept free of `server-only`/env/database imports so the Better Auth
// CLI can load it without modifying production source files.
export const auth = betterAuth(authSchemaOptions);
