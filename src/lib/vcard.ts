/**
 * vCard 3.0 generation for the public Career Card "Save Contact" action.
 *
 * Only public-safe fields are accepted: everything passed here has already
 * been filtered by PublicCareerProfileDTO / CompanyProfileDTO visibility
 * rules (whatsapp only when flagged public, company publicPhone/publicEmail
 * explicitly public, never candidate raw email/phone).
 */

import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";

/** Escape one vCard text value/component per RFC 2426. */
function esc(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * RFC 2426 physical lines must not exceed 75 octets. Values here are
 * predominantly ASCII; fold conservatively at 72 chars so multibyte
 * sequences stay under the limit in practice.
 */
function fold(line: string): string {
  if (line.length <= 72) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 72) parts.push(line.slice(i, i + 72));
  return parts.join("\r\n ");
}

/** Assemble a vCard, skipping empty fields. `raw` fields are pre-escaped
 *  structured values (N, ADR) whose semicolons are delimiters. */
export function buildVCard(
  fields: [
    name: string,
    value: string | null | undefined,
    params?: string,
    raw?: boolean,
  ][],
): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  for (const [name, value, params, raw] of fields) {
    if (!value) continue;
    const head = params ? `${name};${params}` : name;
    lines.push(fold(`${head}:${raw ? value : esc(value)}`));
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** wa.me/<digits> → E.164-style "+<digits>" (only ever called on URLs that
 *  were already approved as public). */
function telFromWhatsapp(url: string | null | undefined): string | null {
  const digits = url?.match(/wa\.me\/(\d+)/)?.[1];
  return digits ? `+${digits}` : null;
}

function absoluteUrl(
  url: string | null | undefined,
  origin: string | undefined,
): string | null {
  if (!url) return null;
  if (!origin) return url;
  try {
    return new URL(url, origin).href;
  } catch {
    return url;
  }
}

export function vcardFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "contact"}.vcf`;
}

export interface VCardOptions {
  /** Permanent share URL (/n/<token>) — embedded as the contact's profile URL. */
  shareUrl?: string | null;
  /** Origin used to absolutize relative asset URLs (photo/logo). */
  origin?: string;
}

/** Candidate side — name/role/org plus only authorized public channels. */
export function candidateVCard(
  c: CompactCandidate,
  opts: VCardOptions = {},
): string {
  const parts = c.name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");
  return buildVCard([
    ["N", `${esc(last)};${esc(first)};;;`, undefined, true],
    ["FN", c.name],
    ["TITLE", c.headline || null],
    ["ROLE", c.currentRole ?? null],
    ["ORG", c.currentCompany ?? null],
    [
      "TEL",
      telFromWhatsapp(c.whatsappUrl) ?? c.publicPhone ?? null,
      "TYPE=CELL,VOICE",
    ],
    ["EMAIL", c.publicEmail ?? null, "TYPE=INTERNET"],
    ["ADR", c.location ? `;;${esc(c.location)};;;;` : null, "TYPE=WORK", true],
    ["URL", opts.shareUrl ?? null, "TYPE=PROFILE"],
    ["URL", c.website ?? null, "TYPE=WORK"],
    ["URL", c.linkedin ?? null, "TYPE=LINKEDIN"],
    ["URL", c.github ?? null, "TYPE=GITHUB"],
    ["URL", c.portfolioUrl ?? null, "TYPE=PORTFOLIO"],
    ["URL", c.showreelUrl ?? null, "TYPE=SHOWREEL"],
    ["PHOTO", absoluteUrl(c.portrait, opts.origin), "VALUE=URI"],
    ["NOTE", c.availability ?? null],
  ]);
}

/** Company side — organization card with only public company channels. */
export function companyVCard(
  c: CompactCompany,
  opts: VCardOptions = {},
): string {
  const contactNote = c.contactPerson
    ? `Contact: ${c.contactPerson}${c.contactPersonRole ? ` (${c.contactPersonRole})` : ""}`
    : null;
  const socials: [string, string | null | undefined][] = [
    ["LINKEDIN", c.linkedin],
    ["FACEBOOK", c.facebook],
    ["INSTAGRAM", c.instagram],
    ["X", c.x],
    ["YOUTUBE", c.youtube],
    ["TIKTOK", c.tiktok],
  ];
  return buildVCard([
    ["N", `${esc(c.companyName)};;;;`, undefined, true],
    ["FN", c.companyName],
    ["ORG", c.companyName],
    ["ROLE", c.tagline ?? null],
    ["TEL", c.publicPhone ?? null, "TYPE=WORK,VOICE"],
    ["TEL", telFromWhatsapp(c.whatsappUrl), "TYPE=CELL"],
    ["EMAIL", c.publicEmail ?? null, "TYPE=INTERNET,WORK"],
    ...c.locations.map((loc): [string, string, string, boolean] => [
      "ADR",
      `;;${esc(loc)};;;;`,
      "TYPE=WORK",
      true,
    ]),
    ["URL", c.website ?? null, "TYPE=WORK"],
    ["URL", opts.shareUrl ?? null, "TYPE=PROFILE"],
    ...socials.map((s): [string, string | null | undefined, string] => [
      "URL",
      s[1],
      `TYPE=${s[0]}`,
    ]),
    ["LOGO", absoluteUrl(c.logo, opts.origin), "VALUE=URI"],
    ["NOTE", contactNote],
    ["CATEGORIES", c.industry ?? null],
  ]);
}

/** A Save Contact action is only shown when the saved card would carry
 *  meaningful, authorized contact data (a name plus at least one real
 *  channel or the permanent profile link). */
export function hasCandidateContact(
  c: CompactCandidate,
  shareUrl?: string | null,
): boolean {
  if (!c.name?.trim()) return false;
  return Boolean(
    shareUrl ||
    c.whatsappUrl ||
    c.publicPhone ||
    c.publicEmail ||
    c.linkedin ||
    c.github ||
    c.website ||
    c.portfolioUrl ||
    c.showreelUrl,
  );
}

export function hasCompanyContact(
  c: CompactCompany,
  shareUrl?: string | null,
): boolean {
  if (!c.companyName?.trim()) return false;
  return Boolean(
    shareUrl ||
    c.publicPhone ||
    c.publicEmail ||
    c.whatsappUrl ||
    c.website ||
    c.linkedin ||
    c.facebook ||
    c.instagram ||
    c.x ||
    c.youtube ||
    c.tiktok,
  );
}
