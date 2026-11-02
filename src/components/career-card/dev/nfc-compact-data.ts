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
  svg,
} from "@/components/career-card/dev/nfc-compact-media";

export type CompactCandidate = {
  name: string;
  headline: string;
  currentRole?: string;
  currentCompany?: string;
  /** Public location label (e.g. "Dubai, UAE") — used by Save Contact. */
  location?: string | null;
  portrait?: string;
  /** Optional cover art — object-cover with focal position/zoom. */
  cover?: string | null;
  coverFocalX?: number;
  coverFocalY?: number;
  coverZoom?: number;
  initials: string;
  publicPhone?: string | null;
  publicEmail?: string | null;
  /** https://wa.me/<digits> — only present when flagged public. */
  whatsappUrl?: string | null;
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
  /** Public href for the Portfolio/CV action card (production: /u/<slug>/resume). */
  portfolioHref?: string | null;
  availability?: string | null;
  /** Canonical MCP career identity metadata (IT7B). */
  professionalCategories?: string[];
  genres?: string[];
  portfolioUrl?: string | null;
  showreelUrl?: string | null;
  languages?: { language: string; fluency?: string | null }[];
};

export type CompactCompany = {
  companyName: string;
  logo?: string;
  /** Optional cover art — object-cover with focal position/zoom. */
  cover?: string | null;
  coverFocalX?: number;
  coverFocalY?: number;
  coverZoom?: number;
  tagline?: string;
  contactPerson?: string;
  contactPersonRole?: string;
  publicPhone?: string | null;
  publicEmail?: string | null;
  /** https://wa.me/<digits> — only present when flagged public. */
  whatsappUrl?: string | null;
  website?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  x?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  about?: string;
  industry?: string;
  locations: string[];
  services: string[];
  hiringOpen?: boolean;
  openRolesSummary?: string;
  openRolesUrl?: string | null;
  companyProfileSummary?: string;
  companyProfileUrl?: string | null;
};

/** Demo cover — abstract dark indigo band (synthetic, no imagery). */
export const demoCover = svg(
  `
<defs>
<linearGradient id="cv" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#172554"/><stop offset="1" stop-color="#0f172a"/>
</linearGradient>
<linearGradient id="tr" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#3b82f6" stop-opacity="0"/>
<stop offset="0.6" stop-color="#60a5fa" stop-opacity="0.5"/>
<stop offset="1" stop-color="#93c5fd" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="400" height="140" fill="url(#cv)"/>
<rect x="0" y="96" width="400" height="2" fill="url(#tr)"/>
<g fill="#93c5fd" opacity="0.25">
<rect x="330" y="18" width="8" height="8" rx="1"/>
<rect x="342" y="18" width="8" height="8" rx="1" opacity="0.4"/>
<rect x="330" y="30" width="8" height="8" rx="1" opacity="0.4"/>
<rect x="342" y="30" width="8" height="8" rx="1"/>
</g>
`,
  400,
  140,
);

export const DEMO_CANDIDATE_RICH: CompactCandidate = {
  cover: demoCover,
  name: "Ava Reyes",
  headline: "AI Product Manager — GenAI & Agentic Workflows",
  currentRole: "Senior AI Product Manager",
  currentCompany: "Skyline AI",
  portrait: svgPortrait,
  initials: "AR",
  publicPhone: "+1 415 555 0192",
  publicEmail: "ava.reyes@rolerace-demo.dev",
  whatsappUrl: "https://wa.me/14155550192",
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
  cover: demoCover,
  companyName: "Skyline AI",
  logo: svgLogo,
  tagline: "Enterprise Agentic Platforms",
  contactPerson: "Ava Reyes",
  publicPhone: "+1 415 555 0148",
  publicEmail: "hello@skyline-demo.dev",
  website: "https://skyline-demo.dev",
  whatsappUrl: "https://wa.me/14155550148",
  linkedin: "https://www.linkedin.com/company/skyline-demo",
  facebook: "https://facebook.com/skyline-demo",
  instagram: "https://instagram.com/skyline.demo",
  x: "https://x.com/skyline_demo",
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
