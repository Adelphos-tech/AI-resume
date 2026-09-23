import {
  DEFAULT_RESUME_SECTION_ORDER,
  resumeDataSchema,
  type ResumeData,
} from "@/lib/resume-schema";
import type { MasterCareerProfileData } from "@/lib/master-career-profile-schema";

/**
 * Deterministic MCP → ResumeData composer.
 *
 * No rewriting, no paraphrasing, no invented content, no randomness,
 * no clocks — the same profile always produces the same document.
 *
 * Every renderable text block carries a deterministic id derived from
 * the canonical MCP entry UUID, so future template rendering and AI
 * review can trace a rendered line back to its exact source fact.
 */
export function composeResumeFromMasterProfile(
  profile: MasterCareerProfileData,
): ResumeData {
  const block = (id: string, text: string | null) =>
    text ? { id, text } : null;

  const data = {
    basics: {
      fullName: profile.basics.fullName ?? "",
      headline: profile.basics.headline,
      email: profile.basics.email,
      phone: profile.basics.phone,
      location: profile.basics.location,
      links: profile.basics.links.map((l) => ({ label: l.label, url: l.url })),
    },
    summary: block("basics:summary", profile.basics.summary),
    experience: profile.work.map((w) => ({
      sourceId: w.id,
      blockId: `work:${w.id}`,
      company: w.company,
      position: w.position,
      location: w.location,
      employmentType: w.employmentType,
      startDate: w.startDate,
      endDate: w.endDate,
      isCurrent: w.isCurrent,
      summary: block(`work:${w.id}:summary`, w.summary),
      highlights: w.highlights.map((text, i) => ({
        id: `work:${w.id}:highlight:${i}`,
        text,
      })),
    })),
    education: profile.education.map((e) => ({
      sourceId: e.id,
      blockId: `education:${e.id}`,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      grade: e.grade,
      highlights: e.highlights.map((text, i) => ({
        id: `education:${e.id}:highlight:${i}`,
        text,
      })),
    })),
    skills: profile.skills.map((s) => ({
      sourceId: s.id,
      blockId: `skill:${s.id}`,
      name: s.name,
      keywords: s.keywords.map((text, i) => ({
        id: `skill:${s.id}:keyword:${i}`,
        text,
      })),
    })),
    projects: profile.projects.map((p) => ({
      sourceId: p.id,
      blockId: `project:${p.id}`,
      name: p.name,
      description: block(`project:${p.id}:description`, p.description),
      url: p.url,
      startDate: p.startDate,
      endDate: p.endDate,
      highlights: p.highlights.map((text, i) => ({
        id: `project:${p.id}:highlight:${i}`,
        text,
      })),
    })),
    certifications: profile.certifications.map((c) => ({
      sourceId: c.id,
      blockId: `certification:${c.id}`,
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      expiryDate: c.expiryDate,
      credentialId: c.credentialId,
      url: c.url,
    })),
    languages: profile.languages.map((l) => ({
      sourceId: l.id,
      blockId: `language:${l.id}`,
      language: l.language,
      fluency: l.fluency,
    })),
    sectionOrder: DEFAULT_RESUME_SECTION_ORDER,
  };

  // Composition output always passes the canonical ResumeData contract.
  return resumeDataSchema.parse(data);
}
