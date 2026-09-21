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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n  ");
  throw new Error(`Invalid environment configuration:\n  ${details}`);
}

export const env: Readonly<z.infer<typeof envSchema>> = parsed.data;
