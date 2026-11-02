/**
 * Maps an AI-review finding's canonical resume block id back to the
 * editable source entry in the candidate's Career Profile.
 *
 * Block ids are produced by the deterministic MCP → ResumeData composer
 * (compose-resume.ts):
 *   basics:summary                     → Basics section
 *   work:{uuid}:summary|highlight:{i}  → Experience entry {uuid}
 *   education:{uuid}:highlight:{i}     → Education entry {uuid}
 *   skill:{uuid}:keyword:{i}           → Skills group {uuid}
 *   project:{uuid}:description|highlight:{i} → Project entry {uuid}
 *
 * Anything that does not match this scheme returns null — the caller
 * must not show an edit action for unresolvable findings.
 */

const PREFIX_TO_SECTION = {
  basics: "basics",
  work: "work",
  education: "education",
  skill: "skills",
  project: "projects",
} as const;

export type ProfileSectionKey =
  | "basics"
  | "work"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export const PROFILE_SECTION_KEYS: readonly ProfileSectionKey[] = [
  "basics",
  "work",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProfileEditTarget = {
  section: ProfileSectionKey;
  entryId: string | null;
  href: string;
};

export function resolveProfileEditTarget(
  blockId: string,
): ProfileEditTarget | null {
  const [prefix, entryId, ...rest] = blockId.split(":");
  const section = PREFIX_TO_SECTION[prefix as keyof typeof PREFIX_TO_SECTION];
  if (!section) return null;

  if (prefix === "basics") {
    return entryId === "summary" && rest.length === 0
      ? { section, entryId: null, href: "/candidate/profile?section=basics" }
      : null;
  }

  // Entry-scoped blocks must carry the canonical MCP entry UUID plus a
  // sub-key (summary / description / highlight:i / keyword:i).
  if (!UUID_RE.test(entryId ?? "") || rest.length === 0) return null;

  const params = new URLSearchParams({ section, entry: entryId });
  return { section, entryId, href: `/candidate/profile?${params}` };
}
