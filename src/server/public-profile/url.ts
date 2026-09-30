import "server-only";

import { z } from "zod";

const publicHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  });

const INVALID_URL = "\0invalid-url";

/**
 * Trusted URL normalization (f8d4c02) — scheme-less input is upgraded to
 * https; explicit schemes must be http(s); blank → null; everything else
 * fails validation. Never trust the original string.
 */
export const nullableUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => {
      if (v === "") return null;
      try {
        // Explicit scheme present — only http(s) may pass.
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:"
          ? u.href
          : INVALID_URL;
      } catch {
        // Scheme-less input — normalize to https and validate.
        try {
          return new URL(`https://${v}`).href;
        } catch {
          return INVALID_URL;
        }
      }
    })
    .pipe(publicHttpUrl.nullable());
