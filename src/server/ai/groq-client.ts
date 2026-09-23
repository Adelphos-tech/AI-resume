import "server-only";

import Groq from "groq-sdk";

/**
 * Server-only Groq client. The key is validated lazily at call time so
 * builds, health, and every non-AI feature work without configuration.
 */

export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_RATE_LIMITED"
  | "AI_INVALID_RESPONSE"
  | "AI_REVIEW_FAILED";

export class AiServiceError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AiServiceError";
    this.code = code;
  }
}

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export function getGroqModel(): string {
  return process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
}

let client: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiServiceError("AI_NOT_CONFIGURED");
  }
  client ??= new Groq({ apiKey });
  return client;
}

/** Maps a Groq/SDK failure to a safe application error. */
export function toAiServiceError(err: unknown): AiServiceError {
  if (err instanceof AiServiceError) {
    return err;
  }
  const status =
    err && typeof err === "object" && "status" in err
      ? Number((err as { status?: unknown }).status)
      : undefined;
  if (status === 401 || status === 403) {
    return new AiServiceError("AI_NOT_CONFIGURED");
  }
  if (status === 429) {
    return new AiServiceError("AI_RATE_LIMITED");
  }
  if (typeof status === "number" && status >= 500) {
    return new AiServiceError("AI_PROVIDER_UNAVAILABLE");
  }
  // Network/transport failures surface without a status.
  return new AiServiceError("AI_PROVIDER_UNAVAILABLE");
}
