/**
 * Semantic Languages content — explicit values only, no inference.
 */
import type { DemoLanguage } from "@/components/career-card/dev/demo-career-profile";

export type { DemoLanguage };

/** "English — Native" / "English" */
export function languageLine(l: DemoLanguage) {
  return l.proficiency ? `${l.language} — ${l.proficiency}` : l.language;
}
