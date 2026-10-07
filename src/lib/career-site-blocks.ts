import type { CareerSiteBlockType } from "@/generated/prisma/enums";

import { customTextContentSchema } from "@/lib/career-site-block-content";

/**
 * Reads persisted CUSTOM_TEXT content.
 * - null → not yet initialized
 * - valid { text } → the authored text (empty string preserved)
 * - anything else → "invalid" (safe fallback, never raw JSON)
 */
export function readCustomTextContent(
  content: unknown,
): { kind: "empty" } | { kind: "text"; text: string } | { kind: "invalid" } {
  if (content === null || content === undefined) return { kind: "empty" };
  const parsed = customTextContentSchema.safeParse(content);
  if (!parsed.success) return { kind: "invalid" };
  return { kind: "text", text: parsed.data.text };
}

export const CAREER_SITE_BLOCK_LABELS: Record<CareerSiteBlockType, string> = {
  HERO: "Hero",
  CUSTOM_TEXT: "Custom text",
  EXPERIENCE: "Experience",
};

/**
 * Pure presentation helper: returns the complete ordered id list after
 * swapping the block at `index` one step in `direction`. Returns the
 * input unchanged at boundaries. The domain requires the full ordered
 * set — never a partial list.
 */
export function moveBlock(
  blockIds: string[],
  index: number,
  direction: "up" | "down",
): string[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= blockIds.length) return blockIds;
  const next = [...blockIds];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
