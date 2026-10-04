import { z } from "zod";

/**
 * Canonical CUSTOM_TEXT block-content contract, shared by the server
 * mutation boundary and safe read/presentation parsing. Strict object:
 * `null` means uninitialized, `{ text: "" }` is a deliberate explicit
 * clear — the schema never trims or transforms the authored text.
 */
export const customTextContentSchema = z.strictObject({
  text: z.string().max(20_000),
});
