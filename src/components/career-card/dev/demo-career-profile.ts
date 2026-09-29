/**
 * Synthetic demo career profile for the development-only Career Card Library
 * lab. Not connected to PublicProfileDTO; safe representative values only.
 */

const svg = (body: string, w = 1200, h = 500) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  )}`;

/** Wide landscape / city-at-dusk photographic stand-in. */
export const DEMO_COVER_LANDSCAPE = svg(`
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#2e1065"/><stop offset="0.55" stop-color="#7c3aed"/><stop offset="1" stop-color="#c4b5fd"/>
</linearGradient>
</defs>
<rect width="1200" height="500" fill="url(#sky)"/>
<circle cx="960" cy="150" r="70" fill="#f5d0fe" opacity="0.9"/>
<g fill="#1e1b4b" opacity="0.92">
<rect x="60" y="240" width="90" height="260"/><rect x="180" y="200" width="70" height="300"/>
<rect x="280" y="280" width="110" height="220"/><rect x="430" y="170" width="80" height="330"/>
<rect x="540" y="260" width="60" height="240"/><rect x="640" y="220" width="100" height="280"/>
<rect x="780" y="300" width="80" height="200"/><rect x="900" y="260" width="90" height="240"/>
<rect x="1030" y="210" width="110" height="290"/>
</g>
<g fill="#c4b5fd" opacity="0.5">
<rect x="200" y="230" width="10" height="10"/><rect x="450" y="200" width="10" height="10"/>
<rect x="680" y="250" width="10" height="10"/><rect x="1050" y="240" width="10" height="10"/>
</g>`);

/** Subject-focused cover — person in workspace feel. */
export const DEMO_COVER_SUBJECT = svg(`
<defs>
<linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#4c1d95"/><stop offset="1" stop-color="#312e81"/>
</linearGradient>
<radialGradient id="spot2" cx="0.5" cy="0.45" r="0.6">
  <stop offset="0" stop-color="#a78bfa" stop-opacity="0.85"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1200" height="500" fill="url(#bg2)"/>
<rect width="1200" height="500" fill="url(#spot2)"/>
<circle cx="600" cy="190" r="80" fill="#ddd6fe"/>
<path d="M430 500 Q600 330 770 500 Z" fill="#c7d2fe"/>
<rect x="820" y="300" width="220" height="140" rx="12" fill="#1e1b4b" opacity="0.8"/>`);

/** Demo portrait — abstract avatar photo stand-in. */
export const DEMO_PORTRAIT = svg(
  `
<defs><radialGradient id="pa" cx="0.5" cy="0.4" r="0.8">
<stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#2e1065"/></radialGradient></defs>
<rect width="400" height="400" fill="url(#pa)"/>
<circle cx="200" cy="160" r="70" fill="#ddd6fe"/>
<path d="M90 400 Q200 270 310 400 Z" fill="#c7d2fe"/>`,
  400,
  400,
);

export type DemoMedia = "landscape" | "subject" | "none";

export const DEMO_CAREER_PROFILE = {
  name: "Ava Reyes",
  headline: "AI Product Manager — GenAI & Agentic Workflows",
  location: "San Francisco, CA",
  openToOpportunities: true,
  portrait: DEMO_PORTRAIT,
  initials: "AR",
  covers: {
    landscape: DEMO_COVER_LANDSCAPE,
    subject: DEMO_COVER_SUBJECT,
  } as const,
  yearsExperience: 8,
  projectsCount: 3,
  companiesCount: 3,
  certificationsCount: 1,
  hasResume: true,
  links: {
    linkedin: "https://www.linkedin.com/in/demo-career",
    github: "https://github.com/demo-career",
    website: "https://demo-career.example.com",
  },
};

/* ── Career content fixtures ─────────────────────────────────────────── */

export type DemoExperience = {
  position: string;
  company: string;
  start: string;
  end?: string;
  current?: boolean;
  location?: string;
  summary?: string;
  highlights?: string[];
};

export type DemoProject = {
  name: string;
  description: string;
  url?: string;
  role?: string;
  tags?: string[];
};

export const DEMO_EXPERIENCE_RICH: DemoExperience[] = [
  {
    position: "Senior AI Product Manager",
    company: "Skyline AI",
    start: "2022",
    current: true,
    location: "San Francisco",
    summary:
      "Owns the agentic workflow platform end-to-end — roadmap, eval framework, and enterprise rollouts serving 2M+ users. Partners daily with research and infra leads.",
    highlights: [
      "Launched GenAI platform to 2M+ users",
      "Cut model eval cycle 40%",
    ],
  },
  {
    position: "Product Manager",
    company: "Meridian Systems",
    start: "2020",
    end: "2022",
    location: "New York",
    summary: "Led RAG-powered search product for 300+ enterprise accounts.",
    highlights: ["Shipped semantic search v2"],
  },
  {
    position: "Associate Product Manager",
    company: "Corebridge",
    start: "2018",
    end: "2019",
    location: "Boston",
  },
];

export const DEMO_PROJECTS_RICH: DemoProject[] = [
  {
    name: "Agentic Workflow Platform",
    description:
      "Multi-step LLM automation with human review gates, deterministic retries, and tenant-scoped evaluation.",
    url: "https://demo-career.example.com/agentic",
    role: "Product Lead",
    tags: ["LLM", "Platform"],
  },
  {
    name: "LLM Eval Harness",
    description: "Quality-scoring framework for prompt regression testing.",
    role: "Owner",
    tags: ["Evals"],
  },
  {
    name: "Semantic Search",
    description: "RAG retrieval layer over 40M documents.",
    url: "https://demo-career.example.com/search",
    tags: ["RAG", "Search"],
  },
  {
    name: "Onboarding Funnel Revamp",
    description:
      "Activation experiments across signup, import, and first-value.",
    tags: ["Growth"],
  },
];

export const DEMO_SKILLS_RICH = [
  "Product Strategy",
  "Roadmapping",
  "LLM Systems",
  "RAG",
  "Prompt Engineering",
  "Eval Design",
  "Experimentation",
  "APIs",
  "SQL",
  "Python",
  "Stakeholder Management",
  "Enterprise Sales Cycles",
  "OKRs",
  "Technical Writing",
];

export const DEMO_EXPERIENCE_SPARSE: DemoExperience[] = [
  {
    position: "Product Manager",
    company: "Skyline AI",
    start: "2021",
    current: true,
    location: "San Francisco",
    summary: "Building the agentic workflow platform.",
  },
];
export const DEMO_PROJECTS_SPARSE: DemoProject[] = [
  {
    name: "LLM Eval Harness",
    description: "Quality-scoring framework for prompt regression testing.",
    tags: ["Evals"],
  },
];
export const DEMO_SKILLS_SPARSE = [
  "Product Strategy",
  "LLM Systems",
  "SQL",
  "Roadmapping",
];

export const DEMO_EXPERIENCE_LONG: DemoExperience[] = [
  {
    position: "Senior Staff Artificial-Intelligence Product Manager",
    company: "The International Skyline Artificial Intelligence Corporation",
    start: "2020",
    current: true,
    location: "San Francisco Bay Area, California",
    summary:
      "Owns the agentic workflow platform end-to-end across roadmap, evaluation frameworks, enterprise onboarding, partner integrations, and cross-regional rollout — coordinating research, infrastructure, design, legal, and sales stakeholders while serving more than two million monthly active users in regulated industries.",
    highlights: [
      "Launched the GenAI platform to two million monthly active users across three regulated markets",
      "Reduced model evaluation cycle time by forty percent through a deterministic regression harness",
    ],
  },
  {
    position: "Associate Product Manager, Enterprise Integrations",
    company: "Corebridge Analytics International Holdings",
    start: "2018",
    end: "2020",
    location: "Boston",
  },
];

export const DEMO_PROJECTS_LONG: DemoProject[] = [
  {
    name: "Multi-Tenant Agentic Workflow Orchestration & Evaluation Platform",
    description:
      "Multi-step LLM automation with human review gates, deterministic retries, tenant-scoped evaluation, audit-grade tracing, and regional data residency controls.",
    url: "https://demo-career.example.com/agentic",
    role: "Principal Product Lead",
    tags: ["LLM", "Platform", "Enterprise"],
  },
  {
    name: "Semantic Retrieval-Augmented Generation Search Infrastructure",
    description: "RAG retrieval layer over forty million documents.",
    tags: ["RAG", "Search", "Infrastructure"],
  },
];

export const DEMO_SKILLS_LONG = [
  "Cross-Functional Product Strategy",
  "Enterprise Roadmapping",
  "Large Language Model Systems",
  "Retrieval-Augmented Generation",
  "Prompt Engineering & Evaluation",
  "Statistical Experimentation",
  "Public API Design",
  "Advanced SQL & Analytics",
  "Executive Stakeholder Management",
  "Regulated-Market Enterprise Sales Cycles",
];

/* ── Supporting career fixtures ──────────────────────────────────────── */

export type DemoEducation = {
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
};

export type DemoCertification = {
  name: string;
  issuer?: string;
  issued?: string;
  expires?: string;
  credentialUrl?: string;
};

export type DemoLanguage = {
  language: string;
  proficiency?: string;
};

export type DemoResume = {
  hasResume: boolean;
  title?: string;
  href?: string;
};

export const DEMO_EDUCATION_RICH: DemoEducation[] = [
  {
    degree: "MBA",
    fieldOfStudy: "Business & Technology",
    institution: "INSEAD",
    start: "2017",
    end: "2018",
    location: "Fontainebleau",
  },
  {
    degree: "B.S. Computer Science",
    institution: "University of Illinois",
    start: "2012",
    end: "2016",
    location: "Urbana-Champaign",
  },
];

export const DEMO_CERTS_RICH: DemoCertification[] = [
  {
    name: "PMP",
    issuer: "PMI",
    issued: "2021",
    credentialUrl: "https://demo-career.example.com/pmp",
  },
  {
    name: "Certified Scrum Product Owner",
    issuer: "Scrum Alliance",
    issued: "2020",
  },
  {
    name: "AWS Solutions Architect — Associate",
    issuer: "Amazon Web Services",
    issued: "2022",
    expires: "2025",
  },
];

export const DEMO_LANGS_RICH: DemoLanguage[] = [
  { language: "English", proficiency: "Native" },
  { language: "Spanish", proficiency: "Fluent" },
  { language: "German", proficiency: "B2" },
];

export const DEMO_RESUME_RICH: DemoResume = {
  hasResume: true,
  title: "Senior AI Product Manager — Résumé",
};

export const DEMO_EDUCATION_SPARSE: DemoEducation[] = [
  {
    degree: "B.S. Computer Science",
    institution: "University of Illinois",
    end: "2016",
  },
];
export const DEMO_CERTS_SPARSE: DemoCertification[] = [];
export const DEMO_LANGS_SPARSE: DemoLanguage[] = [
  { language: "English", proficiency: "Native" },
];
export const DEMO_RESUME_SPARSE: DemoResume = { hasResume: false };

export const DEMO_EDUCATION_LONG: DemoEducation[] = [
  {
    degree:
      "Master of Business Administration in Strategic Technology Leadership",
    fieldOfStudy: "Business Administration & Emerging Technology Management",
    institution:
      "INSEAD — The Business School for the World, Fontainebleau Campus",
    start: "2017",
    end: "2018",
    location: "Fontainebleau, France",
    description:
      "Focused on technology strategy, organizational transformation, and data-driven decision-making across global enterprise environments.",
  },
  {
    degree: "Bachelor of Science in Computer Science & Software Engineering",
    institution: "University of Illinois Urbana-Champaign",
    start: "2012",
    end: "2016",
  },
];

export const DEMO_CERTS_LONG: DemoCertification[] = [
  {
    name: "Project Management Professional — Global Enterprise Delivery Track",
    issuer: "Project Management Institute International",
    issued: "2021",
    expires: "2027",
    credentialUrl: "https://demo-career.example.com/pmp",
  },
  {
    name: "AWS Certified Solutions Architect — Professional",
    issuer: "Amazon Web Services Training and Certification",
    issued: "2022",
  },
];

export const DEMO_LANGS_LONG: DemoLanguage[] = [
  { language: "English", proficiency: "Native or bilingual proficiency" },
  { language: "Spanish", proficiency: "Full professional working proficiency" },
  { language: "German", proficiency: "Independent user — intermediate B2" },
];

export const DEMO_RESUME_LONG: DemoResume = {
  hasResume: true,
  title: "Senior Staff Artificial-Intelligence Product Manager — Résumé",
};
