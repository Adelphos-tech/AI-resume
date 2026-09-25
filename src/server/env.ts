import "server-only";

import { z } from "zod";

function isPostgresUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "postgresql:" || protocol === "postgres:";
  } catch {
    return false;
  }
}

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL must not be empty")
    .refine(
      isPostgresUrl,
      "DATABASE_URL must be a valid PostgreSQL connection URL (postgresql:// or postgres://)",
    ),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  /** Canonical origin for permanent NFC/share Career Card links
      (e.g. https://go.rolerace.com). Independent of BETTER_AUTH_URL so the
      app and share domains can diverge in production. */
  PUBLIC_SHARE_ORIGIN: z
    .url("PUBLIC_SHARE_ORIGIN must be a valid URL")
    .transform((v) => v.replace(/\/+$/, "")),
  PDF_RENDER_ORIGIN: z
    .string()
    .optional()
    .transform((v) => (v ? v : "http://localhost:3000")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n  ");
  throw new Error(`Invalid environment configuration:\n  ${details}`);
}

export const env: Readonly<z.infer<typeof envSchema>> = parsed.data;
