"use client";

import { useState } from "react";
import {
  DEMO_CANDIDATE_RICH,
  DEMO_CANDIDATE_SPARSE,
  DEMO_COMPANY_RICH,
  DEMO_COMPANY_SPARSE,
  type CompactCandidate,
  type CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { CreativeSpotlightCard } from "@/components/career-card/compositions/nfc-compact/creative-spotlight/creative-spotlight-card";
import { nfcCompactAccentStyle } from "@/components/career-card/compositions/nfc-compact/nfc-compact-accents";

const btn = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
  }`;

const accentBtn = (on: boolean, color: string) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? `border-${color}-600 bg-${color}-600 text-white`
      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
  }`;

const without = <T extends { cover?: string | null }>(o: T): T => ({
  ...o,
  cover: null,
});
const noLogo = (o: CompactCompany): CompactCompany => ({
  ...o,
  logo: undefined,
});

/** Rich fixture with canonical MCP celebrity metadata. */
const CELEBRITY_CANDIDATE: CompactCandidate = {
  ...DEMO_CANDIDATE_RICH,
  name: "Priya Sharma",
  headline: "Actor · Voice Artist · Model",
  currentRole: "Lead Actor",
  currentCompany: "Bollywood Productions",
  professionalSummary:
    "Versatile performer with 10+ years in film, television and theatre. Specialising in dramatic roles and voice acting across multiple languages.",
  professionalCategories: ["Actor", "Voice Artist", "Model"],
  genres: ["Drama", "Thriller", "Comedy", "Period Piece"],
  portfolioUrl: "https://portfolio.example.com/priya",
  showreelUrl: "https://vimeo.com/showreel123",
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Hindi", fluency: "Native" },
    { language: "Tamil", fluency: "Conversational" },
  ],
  skills: ["Method Acting", "Voice Modulation", "Stage Combat", "Dubbing"],
  availability: "Open to opportunities",
};

/** Long-content stress fixture. */
const LONG_CANDIDATE: CompactCandidate = {
  ...DEMO_CANDIDATE_RICH,
  name: "Alexandria Marguerite Williamson-Hartwell",
  headline:
    "Senior Vice President of Artificial Intelligence Product Engineering — Agentic Platforms Division",
  currentRole: "Distinguished Principal AI Product Manager",
  currentCompany: "International Multi-Dimensional Systems Corporation Ltd.",
  professionalCategories: [
    "Extremely Long Professional Category Name",
    "Cross-Disciplinary Creative Director",
  ],
  genres: [
    "Extremely Long Genre Name With Multiple Words",
    "Experimental Avant-Garde Performance Art",
  ],
  skills: [
    "Extremely Long Skill Name With Multiple Words",
    "Large-Scale Distributed Systems Architecture",
    "Cross-Functional Stakeholder Orchestration",
  ],
  education: {
    degree:
      "Master of Business Administration, International Strategy & AI Governance",
    institution: "London Business School of Economics and Political Science",
  },
  certifications: [
    {
      name: "Certified Senior Professional in Artificial Intelligence Governance and Ethics",
      issuer: "International Board",
    },
  ],
};

const LONG_COMPANY: CompactCompany = {
  ...DEMO_COMPANY_RICH,
  companyName:
    "International Multi-Dimensional Artificial Intelligence Systems Corporation Holdings Ltd.",
  tagline:
    "Enterprise-grade agentic intelligence platforms for regulated industries worldwide",
  locations: [
    "San Francisco Bay Area Metropolitan Region, California, United States",
    "Singapore Business District, Central Region",
    "Frankfurt am Main, Hesse, Germany",
  ],
  services: [
    "Enterprise Agentic Workflow Orchestration & Evaluation Infrastructure",
    "Regulated Industry Compliance-as-a-Service Platform",
    "Multilingual Conversational AI Deployment",
  ],
  openRolesSummary:
    "Explore senior engineering, product and go-to-market opportunities across three continents.",
};

const DEMO_URL = "https://rolerace.test/n/demo-career-card";

const ACCENTS = [
  { id: "blue", label: "Blue" },
  { id: "emerald", label: "Emerald" },
  { id: "violet", label: "Violet" },
  { id: "rose", label: "Rose" },
  { id: "amber", label: "Amber" },
  { id: "slate", label: "Slate" },
] as const;

export function NfcCreativeSpotlightLab() {
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]["id"]>("amber");
  const [active, setActive] = useState<"candidate" | "company">("candidate");
  const [density, setDensity] = useState<"rich" | "sparse" | "long">("rich");
  const [cover, setCover] = useState(true);
  const [logo, setLogo] = useState(true);

  let candidate: CompactCandidate;
  let company: CompactCompany;
  if (density === "sparse") {
    candidate = DEMO_CANDIDATE_SPARSE;
    company = DEMO_COMPANY_SPARSE;
  } else if (density === "long") {
    candidate = LONG_CANDIDATE;
    company = LONG_COMPANY;
  } else {
    candidate = CELEBRITY_CANDIDATE;
    company = DEMO_COMPANY_RICH;
  }
  if (!cover) {
    candidate = without(candidate);
    company = without(company);
  }
  if (!logo) company = noLogo(company);

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm font-black text-stone-900">
            NFC Compact — Creative Spotlight
          </span>
          <span className="text-xs text-stone-400">
            dev-only · skin lab · synthetic data
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccent(a.id)}
                className={accentBtn(accent === a.id, a.id)}
              >
                {a.label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-stone-300" />
            {(["rich", "sparse", "long"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setDensity(v)}
                className={btn(density === v)}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-stone-300" />
            <button
              type="button"
              onClick={() => setCover((v) => !v)}
              className={btn(cover)}
            >
              Cover
            </button>
            <button
              type="button"
              onClick={() => setLogo((v) => !v)}
              className={btn(logo)}
            >
              Logo
            </button>
            <span className="mx-1 h-4 w-px bg-stone-300" />
            <button
              type="button"
              onClick={() =>
                setActive((v) => (v === "candidate" ? "company" : "candidate"))
              }
              className={btn(false)}
            >
              Flip
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-8 sm:py-12">
        <CreativeSpotlightCard
          active={active}
          onSwitch={setActive}
          candidate={candidate}
          company={company}
          shareUrl={DEMO_URL}
          accentStyle={nfcCompactAccentStyle(accent)}
          cta={
            active === "candidate"
              ? {
                  href: "https://portfolio.example.com/priya",
                  label: "Get in Touch",
                }
              : { href: "mailto:hello@demo.dev", label: "Contact Us" }
          }
        />
        <p className="mt-10 text-center text-xs text-stone-400">
          Synthetic demo data · development only
        </p>
      </main>
    </div>
  );
}
