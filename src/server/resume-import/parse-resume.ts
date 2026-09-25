import "server-only";

// ---------------------------------------------------------------------------
// Deterministic resume-text structuring for the import preview.
// Pure rules only — no AI, no fuzzy matching. Given the same extracted text
// the output is always identical. Parsed dates normalize to the MCP career
// date shape (YYYY or YYYY-MM) without inventing precision.
// ---------------------------------------------------------------------------

export type ImportBasics = {
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  links: { label: "LinkedIn" | "GitHub" | "Website"; url: string }[];
  summary: string | null;
};

export type ImportWorkItem = {
  key: string;
  position: string | null;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  highlights: string[];
};

export type ImportEducationItem = {
  key: string;
  degree: string | null;
  institution: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type ImportSkillGroup = {
  key: string;
  name: string;
  keywords: string[];
};

export type ImportProjectItem = {
  key: string;
  name: string | null;
  url: string | null;
  highlights: string[];
};

export type ImportCertificationItem = {
  key: string;
  name: string | null;
  issuer: string | null;
  date: string | null;
};

export type ImportLanguageItem = {
  key: string;
  language: string | null;
  fluency: string | null;
};

export type ResumeImportDraft = {
  basics: ImportBasics;
  work: ImportWorkItem[];
  education: ImportEducationItem[];
  skills: ImportSkillGroup[];
  projects: ImportProjectItem[];
  certifications: ImportCertificationItem[];
  languages: ImportLanguageItem[];
  needsReview: { key: string; text: string }[];
};

// --- Section headings --------------------------------------------------------

type SectionKind =
  | "summary"
  | "work"
  | "education"
  | "education-certs"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "other";

// Small explicit alias map — deliberately not an exhaustive synonym list.
const HEADING_ALIASES: [SectionKind, string[]][] = [
  [
    "summary",
    [
      "summary",
      "professional summary",
      "profile",
      "about",
      "objective",
      "professional profile",
      "summary of qualifications",
    ],
  ],
  [
    "work",
    [
      "experience",
      "work experience",
      "professional experience",
      "employment",
      "employment history",
      "work history",
      "career history",
      "professional background",
    ],
  ],
  [
    "education",
    [
      "education",
      "academic background",
      "academic qualifications",
      "education & training",
      "education and training",
    ],
  ],
  [
    "education-certs",
    [
      "education & certifications",
      "education and certifications",
      "education & certificates",
      "education and certificates",
    ],
  ],
  [
    "skills",
    [
      "skills",
      "skills & tools",
      "skills and tools",
      "technical skills",
      "core skills",
      "key skills",
      "competencies",
      "skills & expertise",
    ],
  ],
  [
    "projects",
    [
      "projects",
      "key projects",
      "selected projects",
      "personal projects",
      "notable projects",
    ],
  ],
  [
    "certifications",
    [
      "certifications",
      "certificates",
      "licenses",
      "licenses & certifications",
      "licenses and certifications",
      "certifications & awards",
    ],
  ],
  ["languages", ["languages", "language skills"]],
];

function detectHeading(line: string): SectionKind | null {
  const t = line
    .trim()
    .replace(/[:：]\s*$/, "")
    .toLowerCase();
  if (t.length === 0 || t.length > 60) return null;
  // A heading is either a short line matching the alias map or a short
  // ALL-CAPS line of unknown kind (recorded as a section boundary).
  for (const [kind, aliases] of HEADING_ALIASES) {
    if (aliases.includes(t)) return kind;
  }
  const words = t.split(/\s+/).length;
  const allCaps = /[A-Z]{2}/.test(line) && line === line.toUpperCase();
  return allCaps && words <= 4 && !/\d/.test(t) ? "other" : null;
}

// --- Lexical primitives ------------------------------------------------------

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_RE =
  /https?:\/\/[^\s)>\]]+|(?:www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s)>\]]*)?/gi;
const PHONE_RE = /^\+?[\d][\d\s().\-/]{6,20}$/;
const BULLET_RE = /^[•●·\-\u2013\u2014*▪◦]\s+/;

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

type DateSpan = {
  start: string | null;
  end: string | null;
  isCurrent: boolean;
};

function parseDateToken(t: string): string | null {
  const s = t.trim().toLowerCase();
  if (/^(present|current|now|to date)$/.test(s)) return "PRESENT";
  const monthYear = s.match(/^([a-z]{3,9})\.?\s+(\d{4})$/);
  if (monthYear && MONTHS[monthYear[1]])
    return `${monthYear[2]}-${MONTHS[monthYear[1]]}`;
  const numYear = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (numYear && Number(numYear[1]) >= 1 && Number(numYear[1]) <= 12) {
    return `${numYear[2]}-${numYear[1].padStart(2, "0")}`;
  }
  if (/^\d{4}$/.test(s)) return s;
  return null;
}

/** Returns { dates } when the whole line is a date range, else null. */
function parseDateRange(line: string): DateSpan | null {
  const parts = line
    .split(/\s*[\u2013\u2014—–-]\s*|\s+to\s+|\s*[-–]\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return null;
  const start = parseDateToken(parts[0]);
  const end = parseDateToken(parts[1]);
  if (start === null || start === "PRESENT" || end === null) return null;
  return {
    start,
    end: end === "PRESENT" ? null : end,
    isCurrent: end === "PRESENT",
  };
}

function isStandaloneDateLine(line: string): boolean {
  return parseDateRange(line) !== null;
}

function stripBullet(line: string): string {
  return line.replace(BULLET_RE, "").trim();
}

function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

// --- Section splitting -------------------------------------------------------

type RawSection = {
  kind: SectionKind;
  heading: string | null;
  lines: string[];
};

function splitSections(lines: string[]): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection = { kind: "other", heading: null, lines: [] };

  for (const line of lines) {
    const kind = detectHeading(line);
    if (kind !== null) {
      sections.push(current);
      current = { kind, heading: line.trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections.filter(
    (s) => s.lines.length > 0 || (s.heading === null && s.lines.length > 0),
  );
}

/**
 * Entry splitter: a blank line closes the current entry; a non-bullet,
 * non-date line closes it too when the current entry already carries a
 * date line or bullets (i.e. the next run-on entry has begun).
 */
function splitEntries(lines: string[]): string[][] {
  const entries: string[][] = [];
  let cur: string[] = [];
  let hasDateOrBullets = false;

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) {
      if (cur.length) entries.push(cur);
      cur = [];
      hasDateOrBullets = false;
      continue;
    }
    const isDate = isStandaloneDateLine(t);
    const isBullet = BULLET_RE.test(t);
    if (hasDateOrBullets && !isDate && !isBullet && cur.length) {
      entries.push(cur);
      cur = [];
      hasDateOrBullets = false;
    }
    cur.push(raw);
    if (isDate || isBullet) hasDateOrBullets = true;
  }
  if (cur.length) entries.push(cur);
  return entries;
}

// --- Basics ------------------------------------------------------------------

function classifyLink(url: string): "LinkedIn" | "GitHub" | "Website" {
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return "LinkedIn";
  if (u.includes("github.com")) return "GitHub";
  return "Website";
}

function looksLikeName(line: string): boolean {
  const t = line.trim();
  if (t.length < 2 || t.length > 80) return false;
  if (EMAIL_RE.test(t) || URL_RE.test(t) || /\d/.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  return words.every((w) => /^[\p{L}][\p{L}'.-]*$/u.test(w));
}

function looksLikeLocation(line: string): boolean {
  const t = line.trim();
  if (t.length < 3 || t.length > 60) return false;
  if (EMAIL_RE.test(t) || URL_RE.test(t) || /\d{5,}/.test(t)) return false;
  const parts = t.split(",").map((p) => p.trim());
  return (
    parts.length === 2 && parts.every((p) => /^[\p{L}][\p{L} .-]+$/u.test(p))
  );
}

function parseBasics(lines: string[]): ImportBasics {
  const basics: ImportBasics = {
    fullName: null,
    headline: null,
    email: null,
    phone: null,
    location: null,
    links: [],
    summary: null,
  };
  const seen = new Set<string>();
  let nameLine: string | null = null;
  const leftover: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const email = line.match(EMAIL_RE);
    if (email && !basics.email) basics.email = email[0];
    const lineWithoutEmail = line.replace(EMAIL_RE, "");
    for (const m of lineWithoutEmail.matchAll(URL_RE)) {
      const url = normalizeUrl(m[0]);
      if (!seen.has(url)) {
        seen.add(url);
        basics.links.push({ label: classifyLink(url), url });
      }
    }
    const cleaned = line
      .replace(EMAIL_RE, "")
      .replace(URL_RE, "")
      .replace(/[|•·]/g, " ")
      .trim();
    if (!cleaned) continue;
    if (PHONE_RE.test(cleaned) && !basics.phone) {
      basics.phone = cleaned;
      continue;
    }
    if (!nameLine && looksLikeName(cleaned)) {
      nameLine = cleaned;
      continue;
    }
    if (!basics.location && looksLikeLocation(cleaned)) {
      basics.location = cleaned;
      continue;
    }
    leftover.push(cleaned);
  }

  basics.fullName = nameLine;
  basics.headline = leftover.length > 0 ? leftover[0] : null;
  return basics;
}

// --- Entry parsing ------------------------------------------------------------

function partitionEntry(block: string[]): {
  headers: string[];
  dates: DateSpan | null;
  bullets: string[];
  freeText: string[];
} {
  const headers: string[] = [];
  const bullets: string[] = [];
  const freeText: string[] = [];
  let dates: DateSpan | null = null;
  let headerDone = false;

  for (const line of block) {
    const t = line.trim();
    if (!t) continue;
    if (!headerDone) {
      const d = parseDateRange(t);
      if (d) {
        dates = d;
        headerDone = true;
        continue;
      }
      if (BULLET_RE.test(t)) {
        headerDone = true;
        bullets.push(stripBullet(t));
        continue;
      }
      headers.push(t);
      continue;
    }
    if (BULLET_RE.test(t)) {
      bullets.push(stripBullet(t));
    } else {
      const d = parseDateRange(t);
      if (d && !dates) {
        dates = d;
      } else {
        freeText.push(t);
      }
    }
  }
  return { headers, dates, bullets, freeText };
}

function splitHeader(header: string): { a: string; b: string } | null {
  for (const sep of [" — ", " – ", " @ ", " at "]) {
    if (header.includes(sep)) {
      const [a, ...rest] = header.split(sep);
      return { a: a.trim(), b: rest.join(sep).trim() };
    }
  }
  const commaIdx = header.indexOf(",");
  if (commaIdx > 0 && !/, (inc|ltd|llc)/i.test(header)) {
    return {
      a: header.slice(0, commaIdx).trim(),
      b: header.slice(commaIdx + 1).trim(),
    };
  }
  return null;
}

function parseWorkSection(
  lines: string[],
  pushNeeds: (t: string) => void,
): ImportWorkItem[] {
  const items: ImportWorkItem[] = [];
  let key = 0;

  for (const block of splitEntries(lines)) {
    const { headers, dates, bullets, freeText } = partitionEntry(block);
    if (headers.length === 0) {
      if (bullets.length || freeText.length || dates)
        pushNeeds(block.join("\n"));
      continue;
    }
    const item: ImportWorkItem = {
      key: `work-${key++}`,
      position: null,
      company: null,
      location: null,
      startDate: dates?.start ?? null,
      endDate: dates?.end ?? null,
      isCurrent: dates?.isCurrent ?? false,
      highlights: [...bullets, ...freeText],
    };

    if (headers.length === 1) {
      const split = splitHeader(headers[0]);
      if (split) {
        item.position = split.a;
        item.company = split.b;
      } else {
        item.position = headers[0];
      }
    } else if (headers.length === 2) {
      item.position = headers[0];
      item.company = headers[1];
    } else {
      const last = headers[headers.length - 1];
      if (looksLikeLocation(last)) {
        item.location = last;
        item.position = headers[0];
        item.company = headers.slice(1, -1).join(", ");
      } else {
        item.position = headers[0];
        item.company = headers.slice(1).join(", ");
      }
    }
    items.push(item);
  }
  return items;
}

function parseEducationSection(
  lines: string[],
  pushNeeds: (t: string) => void,
): ImportEducationItem[] {
  const items: ImportEducationItem[] = [];
  let key = 0;

  for (const block of splitEntries(lines)) {
    const { headers, dates, bullets, freeText } = partitionEntry(block);
    const textLines = [...headers, ...freeText];
    if (textLines.length === 0) {
      if (bullets.length || dates) pushNeeds(block.join("\n"));
      continue;
    }
    const extra = [...bullets];
    if (textLines.length > 2) {
      const maybeLoc = textLines[textLines.length - 1];
      const rest = textLines.slice(0, -1);
      const item: ImportEducationItem = {
        key: `edu-${key++}`,
        degree: rest[0],
        institution: rest.slice(1).join(", "),
        location: looksLikeLocation(maybeLoc) ? maybeLoc : null,
        startDate: dates?.start ?? null,
        endDate: dates?.end ?? null,
      };
      if (!item.location) extra.push(maybeLoc);
      items.push(item);
    } else {
      items.push({
        key: `edu-${key++}`,
        degree: textLines[0],
        institution: textLines[1] ?? null,
        location: null,
        startDate: dates?.start ?? null,
        endDate: dates?.end ?? null,
      });
    }
    for (const e of extra) pushNeeds(e);
  }
  return items;
}

const SKILL_SPLIT = /\s*[•●·|]\s*/;

function isSkillLabel(line: string): boolean {
  const t = line.trim();
  return (
    /:$/.test(t) &&
    t.length <= 40 &&
    !/\d/.test(t) &&
    !BULLET_RE.test(t) &&
    t.replace(/:$/, "").length >= 2
  );
}

function splitSkillItems(line: string): string[] {
  return line
    .replace(/:$/, "")
    .split(SKILL_SPLIT)
    .flatMap((p) => {
      // Commas are only safe to split when the chunk isn't obviously a
      // phrase that uses them naturally; conservative rule: split always
      // on commas here since skills lists are enumerations.
      return p.split(/[,，]/);
    })
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 60);
}

function parseSkillsSection(lines: string[]): ImportSkillGroup[] {
  const groups: ImportSkillGroup[] = [];
  let key = 0;
  let pending: ImportSkillGroup | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      pending = null;
      continue;
    }
    const labelMatch = line.match(/^(.{2,40}?):\s+(.+)$/);
    if (labelMatch && !BULLET_RE.test(labelMatch[2])) {
      // "Label: items" on one line.
      const keywords = splitSkillItems(labelMatch[2]);
      if (keywords.length) {
        groups.push({
          key: `skill-${key++}`,
          name: labelMatch[1].trim(),
          keywords,
        });
        pending = null;
        continue;
      }
    }
    if (isSkillLabel(line)) {
      pending = {
        key: `skill-${key++}`,
        name: line.replace(/:$/, "").trim(),
        keywords: [],
      };
      groups.push(pending);
      continue;
    }
    const items = splitSkillItems(line);
    if (!items.length) continue;
    if (pending) {
      pending.keywords.push(...items);
      pending = null;
    } else {
      groups.push({ key: `skill-${key++}`, name: "General", keywords: items });
    }
  }
  return groups;
}

function parseProjectsSection(lines: string[]): ImportProjectItem[] {
  const items: ImportProjectItem[] = [];
  const clean = lines.filter((l) => l.trim());
  let key = 0;
  let cur: ImportProjectItem | null = null;

  for (const raw of clean) {
    const line = raw.trim();
    if (BULLET_RE.test(line)) {
      if (cur) cur.highlights.push(stripBullet(line));
      continue;
    }
    // A new non-bullet line starts a new project.
    const urlMatch = line.match(URL_RE);
    const item: ImportProjectItem = {
      key: `proj-${key++}`,
      name: null,
      url: null,
      highlights: [],
    };
    let name = line;
    if (urlMatch) {
      item.url = normalizeUrl(urlMatch[0]);
      name = name
        .replace(URL_RE, "")
        .replace(/[\s\-–—|]+$/, "")
        .trim();
    }
    // "Name — GitHub" style tails: strip bare platform words.
    name = name
      .replace(/\s*[-–—|]\s*(github|gitlab|link|demo|website)\s*$/i, "")
      .trim();
    if (!name) {
      // Line was only a URL — fold into previous item.
      if (cur && !cur.url) {
        cur.url = item.url;
        continue;
      }
      item.name = item.url;
    } else {
      item.name = name;
    }
    items.push(item);
    cur = item;
  }
  return items;
}

function parseCertificationLines(
  lines: string[],
  pushNeeds: (t: string) => void,
): ImportCertificationItem[] {
  const items: ImportCertificationItem[] = [];
  let key = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || BULLET_RE.test(line.replace(/^[-•]\s*/, ""))) continue;
    const text = stripBullet(line);
    if (!text) continue;
    const date =
      parseDateRange(text) ??
      (parseDateToken(text)
        ? { start: parseDateToken(text), end: null, isCurrent: false }
        : null);
    if (date) {
      // date-only line attaches to previous cert
      if (items.length && !items[items.length - 1].date) {
        items[items.length - 1].date = date.start;
        continue;
      }
      continue;
    }
    const split = splitHeader(text);
    const nameMatch = text.match(/^(.+?)\s*\((.+)\)$/);
    const item: ImportCertificationItem = {
      key: `cert-${key++}`,
      name: null,
      issuer: null,
      date: null,
    };
    if (split) {
      item.name = split.a;
      item.issuer = split.b;
    } else if (nameMatch) {
      item.name = nameMatch[1].trim();
      item.issuer = nameMatch[2].trim();
    } else {
      item.name = text;
    }
    items.push(item);
  }
  if (items.length === 0) pushNeeds(lines.join("\n"));
  return items;
}

function parseLanguageLines(lines: string[]): ImportLanguageItem[] {
  const items: ImportLanguageItem[] = [];
  let key = 0;
  for (const raw of lines) {
    const line = raw.trim().replace(BULLET_RE, "").trim();
    if (!line) continue;
    const split =
      splitHeader(line) ??
      (line.includes(":")
        ? {
            a: line.split(":")[0].trim(),
            b: line.split(":").slice(1).join(":").trim(),
          }
        : null);
    items.push({
      key: `lang-${key++}`,
      language: split ? split.a : line,
      fluency: split ? split.b : null,
    });
  }
  return items;
}

// --- Public API ----------------------------------------------------------------

export function parseResumeText(text: string): ResumeImportDraft {
  const needsReview: { key: string; text: string }[] = [];
  const pushNeeds = (t: string) => {
    const trimmed = t.trim();
    if (trimmed)
      needsReview.push({ key: `nr-${needsReview.length}`, text: trimmed });
  };

  const draft: ResumeImportDraft = {
    basics: {
      fullName: null,
      headline: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      summary: null,
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    needsReview,
  };

  if (!text.trim()) return draft;

  const lines = text.split("\n");
  const sections = splitSections(lines);

  // Everything before the first recognized heading is preamble → basics.
  const preamble: string[] = [];
  const seen = new Set<string>();
  const bodySections: RawSection[] = [];

  let firstRecognizedSeen = false;
  for (const s of sections) {
    if (!firstRecognizedSeen && s.heading === null) {
      preamble.push(...s.lines);
      continue;
    }
    if (!firstRecognizedSeen && s.kind === "other") {
      // unrecognized heading before any known section → preamble-ish header
      // treated as "other" content handled below
    }
    firstRecognizedSeen = true;
    bodySections.push(s);
  }

  draft.basics = parseBasics(preamble);

  for (const s of bodySections) {
    const body = s.lines;
    switch (s.kind) {
      case "summary":
        draft.basics.summary =
          [draft.basics.summary, body.join(" ")]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim() || null;
        break;
      case "work":
        draft.work.push(...parseWorkSection(body, pushNeeds));
        break;
      case "education":
        draft.education.push(...parseEducationSection(body, pushNeeds));
        break;
      case "education-certs": {
        // Conservatively split certification-looking lines vs the rest.
        const certLines: string[] = [];
        const eduLines: string[] = [];
        for (const l of body) {
          if (/certifi|certified|license|credential/i.test(l.trim())) {
            certLines.push(l);
          } else {
            eduLines.push(l);
          }
        }
        if (eduLines.length)
          draft.education.push(...parseEducationSection(eduLines, pushNeeds));
        if (certLines.length)
          draft.certifications.push(
            ...parseCertificationLines(certLines, pushNeeds),
          );
        break;
      }
      case "skills":
        draft.skills.push(...parseSkillsSection(body));
        break;
      case "projects":
        draft.projects.push(...parseProjectsSection(body));
        break;
      case "certifications":
        draft.certifications.push(...parseCertificationLines(body, pushNeeds));
        break;
      case "languages":
        draft.languages.push(...parseLanguageLines(body));
        break;
      case "other": {
        const joined = body.join("\n").trim();
        if (joined) {
          pushNeeds(`${s.heading ? s.heading + "\n" : ""}${joined}`);
        }
        break;
      }
    }
  }

  return draft;
}
