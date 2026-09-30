/**
 * Synthetic demo data for the development-only NFC Compact / Dual Profile
 * template lab. All values are fictional.
 *
 * NOTE: publicPhone / publicEmail exist ONLY in this lab model. They are
 * NOT part of production PublicProfileDTO and must not be added without a
 * dedicated privacy/visibility stage.
 */

import {
  svgPortrait,
  svgLogo,
} from "@/components/career-card/dev/nfc-compact-media";

export type CompactCandidate = {
  name: string;
  headline: string;
  currentRole?: string;
  currentCompany?: string;
  portrait?: string;
  initials: string;
  publicPhone?: string | null;
  publicEmail?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  professionalSummary?: string;
  skills: string[];
  education?: { degree: string; institution?: string } | null;
  yearsExperience?: number;
  experienceSummary?: string;
  certifications: { name: string; issuer?: string }[];
  portfolioAvailable: boolean;
  resumeAvailable: boolean;
  availability?: string | null;
};

export type CompactCompany = {
  companyName: string;
  logo?: string;
  tagline?: string;
  contactPerson?: string;
  publicPhone?: string | null;
  publicEmail?: string | null;
  website?: string | null;
  linkedin?: string | null;
  about: string;
  industry?: string;
  locations: string[];
  services: string[];
  hiringOpen?: boolean;
  openRolesSummary?: string;
  companyProfileSummary?: string;
};

export const DEMO_CANDIDATE_RICH: CompactCandidate = {
  name: "Ava Reyes",
  headline: "AI Product Manager — GenAI & Agentic Workflows",
  currentRole: "Senior AI Product Manager",
  currentCompany: "Skyline AI",
  portrait: svgPortrait,
  initials: "AR",
  publicPhone: "+1 415 555 0192",
  publicEmail: "ava.reyes@rolerace-demo.dev",
  linkedin: "https://www.linkedin.com/in/demo-career",
  github: "https://github.com/demo-career",
  website: "https://demo-career.example.com",
  professionalSummary:
    "Product lead with 8+ years in AI platforms, RAG systems and enterprise rollouts. Passionate about shipping agentic workflows that reach millions of users.",
  skills: [
    "AI & GenAI",
    "Product Strategy",
    "LLM Systems",
    "RAG",
    "Eval Design",
    "Roadmapping",
    "Experimentation",
  ],
  education: { degree: "MBA, Business & Technology", institution: "INSEAD" },
  yearsExperience: 8,
  experienceSummary: "Product / AI Platforms",
  certifications: [
    { name: "PMP", issuer: "PMI" },
    { name: "AWS SA Associate", issuer: "AWS" },
    { name: "CSPO", issuer: "Scrum Alliance" },
  ],
  portfolioAvailable: true,
  resumeAvailable: true,
  availability: "Open to opportunities",
};

export const DEMO_CANDIDATE_SPARSE: CompactCandidate = {
  name: "Ava Reyes",
  headline: "AI Product Manager",
  currentRole: "Product Manager",
  portrait: svgPortrait,
  initials: "AR",
  linkedin: "https://www.linkedin.com/in/demo-career",
  professionalSummary: "Building agentic workflow platforms.",
  skills: ["Product Strategy", "LLM Systems", "SQL"],
  education: { degree: "B.S. Computer Science" },
  certifications: [],
  portfolioAvailable: false,
  resumeAvailable: false,
  availability: null,
};

export const DEMO_COMPANY_RICH: CompactCompany = {
  companyName: "Skyline AI",
  logo: svgLogo,
  tagline: "Enterprise Agentic Platforms",
  contactPerson: "Ava Reyes",
  publicPhone: "+1 415 555 0148",
  publicEmail: "hello@skyline-demo.dev",
  website: "https://skyline-demo.dev",
  linkedin: "https://www.linkedin.com/company/skyline-demo",
  about:
    "Skyline AI is a San Francisco-based enterprise platform company delivering agentic workflow products, evaluation infrastructure and enterprise AI rollouts to help businesses innovate, grow and stay ahead in a digital world.",
  industry: "AI Platforms & Enterprise Software",
  locations: ["San Francisco, CA", "New York, NY"],
  services: [
    "AI Platforms",
    "Eval Infrastructure",
    "Enterprise Integrations",
    "Consulting",
  ],
  hiringOpen: true,
  openRolesSummary: "Explore current opportunities and grow with us.",
  companyProfileSummary:
    "View company profile, work, case studies and achievements.",
};

export const DEMO_COMPANY_SPARSE: CompactCompany = {
  companyName: "Skyline AI",
  logo: svgLogo,
  tagline: "Agentic Platforms",
  contactPerson: "Ava Reyes",
  website: "https://skyline-demo.dev",
  about: "Skyline AI builds agentic workflow platforms for enterprise teams.",
  industry: "AI Platforms",
  locations: ["San Francisco, CA"],
  services: ["AI Platforms", "Consulting"],
  hiringOpen: false,
};
