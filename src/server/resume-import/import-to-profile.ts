import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import {
  createInitialMasterCareerProfileFromCandidate,
  masterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import { resumeImportPayloadSchema } from "@/server/resume-import/import-schema";
import { upsertMasterCareerProfileCore } from "@/server/career-profile/master-career-profile";
import { requireCandidateSession } from "@/server/session";

// ---------------------------------------------------------------------------
// Confirmed resume import → Master Career Profile (safe merge only).
// The reviewed draft is submitted by the browser but ownership, revision
// freshness, canonical IDs, dedupe and size limits are all server-side.
// ---------------------------------------------------------------------------

const norm = (v: string | null | undefined) =>
  (v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export type ImportSummary = {
  added: {
    work: number;
    education: number;
    skills: number;
    projects: number;
    certifications: number;
    languages: number;
    links: number;
  };
  skippedDuplicates: number;
  skippedIncomplete: number;
  basicsFilled: string[];
  basicsKept: string[];
};

export type ImportResult =
  | { success: true; summary: ImportSummary }
  | { success: false; message: string };

export async function importResumeToCareerProfile(
  rawPayload: unknown,
): Promise<ImportResult> {
  const { candidate } = await requireCandidateSession();

  const parsed = resumeImportPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { success: false, message: "Import data is invalid." };
  }
  const payload = parsed.data;

  // Stale-review protection: the extraction the candidate reviewed must
  // still be the current one for their owned source.
  const source = await prisma.candidateResumeSource.findUnique({
    where: { candidateId: candidate.id },
    select: { extraction: { select: { sourceSha256: true, status: true } } },
  });
  if (
    !source?.extraction ||
    source.extraction.status !== "SUCCEEDED" ||
    source.extraction.sourceSha256 !== payload.revision
  ) {
    return {
      success: false,
      message:
        "Your uploaded resume has changed. Please review the latest extraction before importing.",
    };
  }

  const candidateRow = await prisma.candidate.findUniqueOrThrow({
    where: { id: candidate.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      location: true,
      linkedinUrl: true,
      careerProfile: {
        select: { schemaVersion: true, profileData: true },
      },
    },
  });

  // Base document: current canonical profile or the deterministic
  // Candidate-derived initial draft — identical to the manual editor.
  let base: z.infer<typeof masterCareerProfileSchema>;
  if (!candidateRow.careerProfile) {
    base = createInitialMasterCareerProfileFromCandidate(candidateRow);
  } else {
    if (candidateRow.careerProfile.schemaVersion !== 1) {
      return {
        success: false,
        message: "Unsupported profile schema version.",
      };
    }
    const parsedProfile = masterCareerProfileSchema.safeParse(
      candidateRow.careerProfile.profileData,
    );
    if (!parsedProfile.success) {
      return {
        success: false,
        message: "Stored profile data is invalid.",
      };
    }
    base = parsedProfile.data;
  }

  const summary: ImportSummary = {
    added: {
      work: 0,
      education: 0,
      skills: 0,
      projects: 0,
      certifications: 0,
      languages: 0,
      links: 0,
    },
    skippedDuplicates: 0,
    skippedIncomplete: 0,
    basicsFilled: [],
    basicsKept: [],
  };

  // --- Basics: fill empty only, never overwrite ------------------------------
  const basics = { ...base.basics };
  const fillIfEmpty = (
    field: "fullName" | "headline" | "email" | "phone" | "location" | "summary",
    imported: string | null,
  ) => {
    if (!imported) return;
    if (
      basics[field] === null ||
      basics[field] === undefined ||
      basics[field] === ""
    ) {
      basics[field] = imported;
      summary.basicsFilled.push(field);
    } else {
      summary.basicsKept.push(field);
    }
  };
  fillIfEmpty("fullName", payload.basics.fullName);
  fillIfEmpty("headline", payload.basics.headline);
  fillIfEmpty("email", payload.basics.email);
  fillIfEmpty("phone", payload.basics.phone);
  fillIfEmpty("location", payload.basics.location);
  fillIfEmpty("summary", payload.basics.summary);

  const existingUrls = new Set(basics.links.map((l) => l.url.toLowerCase()));
  const links = [...basics.links];
  for (const l of payload.basics.links) {
    if (!existingUrls.has(l.url.toLowerCase())) {
      existingUrls.add(l.url.toLowerCase());
      links.push(l);
      summary.added.links++;
    }
  }
  basics.links = links;

  // --- Work ------------------------------------------------------------------
  const workKey = (w: {
    company: string;
    position: string;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  }) =>
    `${norm(w.company)}|${norm(w.position)}|${w.startDate ?? ""}|${w.endDate ?? ""}|${w.isCurrent}`;

  const workKeys = new Set(base.work.map(workKey));
  const work = [...base.work];
  for (const w of payload.work) {
    if (!w.position || !w.company) {
      summary.skippedIncomplete++;
      continue;
    }
    const k = workKey(w);
    if (workKeys.has(k)) {
      summary.skippedDuplicates++;
      continue;
    }
    workKeys.add(k);
    work.push({
      id: randomUUID(),
      company: w.company,
      position: w.position,
      location: w.location,
      employmentType: null,
      startDate: w.startDate,
      endDate: w.isCurrent ? null : w.endDate,
      isCurrent: w.isCurrent,
      summary: null,
      highlights: w.highlights,
    });
    summary.added.work++;
  }

  // --- Education ---------------------------------------------------------------
  const eduKey = (e: {
    institution: string;
    degree: string | null;
    startDate: string | null;
    endDate: string | null;
  }) =>
    `${norm(e.institution)}|${norm(e.degree)}|${e.startDate ?? ""}|${e.endDate ?? ""}`;

  const eduKeys = new Set(base.education.map(eduKey));
  const education = [...base.education];
  for (const e of payload.education) {
    if (!e.institution) {
      summary.skippedIncomplete++;
      continue;
    }
    const k = eduKey(e);
    if (eduKeys.has(k)) {
      summary.skippedDuplicates++;
      continue;
    }
    eduKeys.add(k);
    education.push({
      id: randomUUID(),
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: null,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      grade: null,
      highlights: [],
    });
    summary.added.education++;
  }

  // --- Skills -------------------------------------------------------------------
  const skills = base.skills.map((g) => ({
    ...g,
    keywords: [...g.keywords],
  }));
  for (const g of payload.skills) {
    if (!g.name || g.keywords.length === 0) {
      summary.skippedIncomplete++;
      continue;
    }
    const target = skills.find((s) => norm(s.name) === norm(g.name));
    if (target) {
      const have = new Set(target.keywords.map((k) => norm(k)));
      for (const kw of g.keywords) {
        if (!have.has(norm(kw))) {
          have.add(norm(kw));
          target.keywords.push(kw);
          summary.added.skills++;
        }
      }
    } else {
      const seen = new Set<string>();
      skills.push({
        id: randomUUID(),
        name: g.name,
        keywords: g.keywords.filter((kw) =>
          seen.has(norm(kw)) ? false : (seen.add(norm(kw)), true),
        ),
      });
      summary.added.skills += skills[skills.length - 1].keywords.length;
    }
  }

  // --- Projects ------------------------------------------------------------------
  const projKey = (p: { name: string; url: string | null }) =>
    `${norm(p.name)}|${norm(p.url)}`;

  const projKeys = new Set(base.projects.map(projKey));
  const projects = [...base.projects];
  for (const p of payload.projects) {
    if (!p.name) {
      summary.skippedIncomplete++;
      continue;
    }
    const k = projKey(p);
    if (projKeys.has(k)) {
      summary.skippedDuplicates++;
      continue;
    }
    projKeys.add(k);
    projects.push({
      id: randomUUID(),
      name: p.name,
      description: null,
      highlights: p.highlights,
      url: p.url,
      startDate: null,
      endDate: null,
    });
    summary.added.projects++;
  }

  // --- Certifications --------------------------------------------------------------
  const certKey = (c: { name: string; issuer: string | null }) =>
    `${norm(c.name)}|${norm(c.issuer)}`;

  const certKeys = new Set(base.certifications.map(certKey));
  const certifications = [...base.certifications];
  for (const c of payload.certifications) {
    if (!c.name) {
      summary.skippedIncomplete++;
      continue;
    }
    const k = certKey(c);
    if (certKeys.has(k)) {
      summary.skippedDuplicates++;
      continue;
    }
    certKeys.add(k);
    certifications.push({
      id: randomUUID(),
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      expiryDate: null,
      credentialId: null,
      url: null,
    });
    summary.added.certifications++;
  }

  // --- Languages ---------------------------------------------------------------------
  const langKeys = new Set(base.languages.map((l) => norm(l.language)));
  const languages = [...base.languages];
  for (const l of payload.languages) {
    if (!l.language) {
      summary.skippedIncomplete++;
      continue;
    }
    if (langKeys.has(norm(l.language))) {
      summary.skippedDuplicates++;
      continue;
    }
    langKeys.add(norm(l.language));
    languages.push({
      id: randomUUID(),
      language: l.language,
      fluency: l.fluency,
    });
    summary.added.languages++;
  }

  const merged = {
    ...base,
    basics,
    work,
    education,
    skills,
    projects,
    certifications,
    languages,
  };

  // Canonical write boundary: full-document revalidation + size cap.
  const result = await upsertMasterCareerProfileCore(candidate.id, merged);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, summary };
}
