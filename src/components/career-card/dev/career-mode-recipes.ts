import {
  DEMO_CAREER_PROFILE,
  DEMO_CERTS_RICH,
  DEMO_EDUCATION_RICH,
  DEMO_EXPERIENCE_RICH,
  DEMO_LANGS_RICH,
  DEMO_PROJECTS_RICH,
  DEMO_RESUME_RICH,
  DEMO_SKILLS_RICH,
  type DemoCertification,
  type DemoEducation,
  type DemoExperience,
  type DemoLanguage,
  type DemoProject,
  type DemoResume,
} from "@/components/career-card/dev/demo-career-profile";

/**
 * Career Modes — dev-only lab model.
 *
 * One canonical Master Career Profile + a recipe per mode.
 * Modes change emphasis/order/density/CTA — never the facts.
 */

export type CareerModeId =
  "general" | "recruiter" | "networking" | "client" | "job-application";

export type CareerSectionId =
  | "targetContext"
  | "snapshot"
  | "intro"
  | "currentRole"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "credentials"
  | "languages"
  | "resume"
  | "connect";

export type CareerActionId = "resume" | "linkedin" | "github" | "website";

export type CareerModeRecipe = {
  id: CareerModeId;
  label: string;
  audience: string;
  description: string;
  /** Dev-only context label shown over the preview. */
  contextLabel: string;
  /** Ordered sections — presence in the array = visible. */
  sections: CareerSectionId[];
  primaryAction: CareerActionId;
  /** Fallback order when the primary action's data is absent. */
  actionFallback: CareerActionId[];
  showOpportunityStatus: boolean;
  experienceLimit?: number;
  projectLimit?: number;
  skillLimit?: number;
  /** Networking — compact hero without the cinematic cover. */
  compactHero?: boolean;
  /** Render the Résumé CTA inside the hero. */
  heroResume?: boolean;
};

/* ── ONE canonical master profile ─────────────────────────────────────── */

export type ModeMasterProfile = {
  name: string;
  initials: string;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  openToOpportunities: boolean;
  portrait?: string;
  yearsExperience?: number;
  projectsCount?: number;
  companiesCount?: number;
  certificationsCount?: number;
  links: {
    linkedin?: string | null;
    github?: string | null;
    website?: string | null;
  };
  cover?: string;
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
  education: DemoEducation[];
  certifications: DemoCertification[];
  languages: DemoLanguage[];
  resume: DemoResume;
};

const MASTER: ModeMasterProfile = {
  ...DEMO_CAREER_PROFILE,
  bio: "Product lead focused on agentic AI workflows and enterprise platforms — I enjoy turning ambiguous problems into shipped systems.",
  cover: DEMO_CAREER_PROFILE.covers.landscape,
  experience: DEMO_EXPERIENCE_RICH,
  projects: DEMO_PROJECTS_RICH,
  skills: DEMO_SKILLS_RICH,
  education: DEMO_EDUCATION_RICH,
  certifications: DEMO_CERTS_RICH,
  languages: DEMO_LANGS_RICH,
  resume: DEMO_RESUME_RICH,
};

/* ── Job Application synthetic target context (lab-only fixture) ──────── */

export const MODE_TARGET_CONTEXT = {
  role: "Senior Product Manager",
  location: "United States",
  resumeTitle: "Product Manager — US",
} as const;

/** Hardcoded relevance selections — no AI, no matching, no ranking. */
const TARGET_RELEVANT = {
  experience: [0, 1],
  projects: [0, 1],
  skills: [
    "Product Strategy",
    "Roadmapping",
    "LLM Systems",
    "RAG",
    "Experimentation",
    "Stakeholder Management",
  ],
} as const;

/* ── Recipes ──────────────────────────────────────────────────────────── */

export const CAREER_MODE_RECIPES: CareerModeRecipe[] = [
  {
    id: "general",
    label: "General",
    audience: "Any professional visitor",
    description:
      "Balanced default professional identity — the full Career Card.",
    contextLabel: "General View",
    sections: [
      "experience",
      "projects",
      "skills",
      "education",
      "credentials",
      "languages",
      "resume",
    ],
    primaryAction: "resume",
    actionFallback: ["linkedin", "github", "website"],
    showOpportunityStatus: true,
    heroResume: true,
  },
  {
    id: "recruiter",
    label: "Recruiter",
    audience: "Recruiters assessing fit quickly",
    description:
      "Assessment-first: availability, years, recent roles, core skills, strongest work, résumé.",
    contextLabel: "Recruiter View",
    sections: [
      "snapshot",
      "experience",
      "skills",
      "projects",
      "credentials",
      "education",
      "resume",
    ],
    primaryAction: "resume",
    actionFallback: ["linkedin", "website", "github"],
    showOpportunityStatus: true,
    experienceLimit: 2,
    projectLimit: 3,
    skillLimit: 8,
    heroResume: true,
  },
  {
    id: "networking",
    label: "Networking",
    audience: "Event / conference / NFC-scan visitors",
    description:
      "Fast introduction — who they are, what they do now, how to connect.",
    contextLabel: "Networking View",
    sections: ["intro", "currentRole", "skills", "projects", "connect"],
    primaryAction: "linkedin",
    actionFallback: ["website", "github", "resume"],
    showOpportunityStatus: false,
    projectLimit: 1,
    skillLimit: 6,
    compactHero: true,
    heroResume: false,
  },
  {
    id: "client",
    label: "Client",
    audience: "Potential clients / customers",
    description:
      "Proof-of-work first — selected work, capabilities, relevant experience.",
    contextLabel: "Client View",
    sections: [
      "projects",
      "skills",
      "experience",
      "credentials",
      "connect",
      "resume",
    ],
    primaryAction: "website",
    actionFallback: ["linkedin", "resume", "github"],
    showOpportunityStatus: true,
    experienceLimit: 2,
    projectLimit: 3,
    skillLimit: 8,
    heroResume: false,
  },
  {
    id: "job-application",
    label: "Job Application",
    audience: `Applying for ${MODE_TARGET_CONTEXT.role} — ${MODE_TARGET_CONTEXT.location}`,
    description:
      "Target-role context: the most relevant experience, projects, skills and the matching résumé.",
    contextLabel: `Job Application · ${MODE_TARGET_CONTEXT.role} · ${MODE_TARGET_CONTEXT.location}`,
    sections: [
      "targetContext",
      "experience",
      "projects",
      "skills",
      "credentials",
      "education",
      "resume",
    ],
    primaryAction: "resume",
    actionFallback: ["linkedin", "website", "github"],
    showOpportunityStatus: true,
    heroResume: false,
  },
];

/* ── Resolution ───────────────────────────────────────────────────────── */

export type ModeAbsence =
  "linkedin" | "github" | "website" | "resume" | "projects" | "credentials";

export type ResolvedAction = {
  id: CareerActionId;
  href: string;
  /** e.g. "View Resume", "Connect on LinkedIn". */
  label: string;
};

/** Central action resolution — one place that owns primary/secondary
 * deduplication by semantic action ID (never by label). */
export type ResolvedModeActions = {
  primary?: ResolvedAction;
  /** Link actions minus the primary destination. */
  secondary: ResolvedAction[];
};

export type ResolvedCareerMode = {
  recipe: CareerModeRecipe;
  profile: ModeMasterProfile;
  sections: CareerSectionId[];
  experience: DemoExperience[];
  projects: DemoProject[];
  skills: string[];
  education: DemoEducation[];
  certifications: DemoCertification[];
  languages: DemoLanguage[];
  resume?: DemoResume;
  /** Primary mode action, resolved through the fallback chain. */
  primaryAction?: ResolvedAction;
  /** Secondary link actions — primary destination already excluded. */
  secondaryActions: ResolvedAction[];
  /** Résumé CTA still shown inside the hero (heroResume && resume exists). */
  heroResumeHref?: string;
  currentRole?: DemoExperience;
  target?: typeof MODE_TARGET_CONTEXT;
};

function hrefFor(master: ModeMasterProfile, a: CareerActionId) {
  if (a === "resume")
    return master.resume.hasResume ? (master.resume.href ?? "#resume") : null;
  return master.links[a as keyof typeof master.links] ?? null;
}

const ACTION_LABELS: Record<CareerModeId, Record<CareerActionId, string>> = {
  general: {
    resume: "View Resume",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website",
  },
  recruiter: {
    resume: "View Resume",
    linkedin: "Connect on LinkedIn",
    github: "GitHub",
    website: "Website",
  },
  networking: {
    resume: "View Resume",
    linkedin: "Connect on LinkedIn",
    github: "GitHub",
    website: "Website",
  },
  client: {
    resume: "View Resume",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "View Portfolio",
  },
  "job-application": {
    resume: "View Target Resume",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website",
  },
};

/** masterProfile + recipe + absences → resolved mode view model. */
export function resolveCareerMode(
  recipe: CareerModeRecipe,
  absent: Set<ModeAbsence>,
): ResolvedCareerMode {
  const m: ModeMasterProfile = {
    ...MASTER,
    links: {
      linkedin: absent.has("linkedin") ? null : MASTER.links.linkedin,
      github: absent.has("github") ? null : MASTER.links.github,
      website: absent.has("website") ? null : MASTER.links.website,
    },
    resume: absent.has("resume") ? { hasResume: false } : MASTER.resume,
    projects: absent.has("projects") ? [] : MASTER.projects,
    certifications: absent.has("credentials") ? [] : MASTER.certifications,
  };

  const pick = <T>(arr: T[], idx: readonly number[]) =>
    idx.map((i) => arr[i]).filter((x): x is T => Boolean(x));

  const targeted = recipe.id === "job-application";
  const experience = targeted
    ? pick(m.experience, TARGET_RELEVANT.experience)
    : m.experience.slice(0, recipe.experienceLimit ?? Infinity);
  const projects = targeted
    ? pick(m.projects, TARGET_RELEVANT.projects)
    : m.projects.slice(0, recipe.projectLimit ?? Infinity);
  const skills = targeted
    ? m.skills.filter((s) =>
        (TARGET_RELEVANT.skills as readonly string[]).includes(s),
      )
    : m.skills.slice(0, recipe.skillLimit ?? Infinity);

  const [primaryId] = [recipe.primaryAction, ...recipe.actionFallback].filter(
    (a) => hrefFor(m, a),
  );
  const primaryAction = primaryId
    ? {
        id: primaryId,
        href: hrefFor(m, primaryId)!,
        label: ACTION_LABELS[recipe.id][primaryId],
      }
    : undefined;

  // Secondary link actions — deduplicated by action ID, never by label.
  // The primary destination must never repeat under another label.
  const secondaryActions = (["linkedin", "github", "website"] as const)
    .filter((id) => id !== primaryId)
    .reduce<ResolvedAction[]>((acc, id) => {
      const href = hrefFor(m, id);
      if (href) acc.push({ id, href, label: ACTION_LABELS[recipe.id][id] });
      return acc;
    }, []);

  return {
    recipe,
    profile: m,
    sections: recipe.sections,
    experience,
    projects,
    skills,
    education: m.education,
    certifications: m.certifications,
    languages: m.languages,
    resume: m.resume.hasResume ? m.resume : undefined,
    primaryAction,
    secondaryActions,
    heroResumeHref:
      recipe.heroResume && m.resume.hasResume
        ? (m.resume.href ?? "#resume")
        : undefined,
    currentRole: m.experience.find((r) => r.current) ?? m.experience[0],
    target: targeted ? MODE_TARGET_CONTEXT : undefined,
  };
}
