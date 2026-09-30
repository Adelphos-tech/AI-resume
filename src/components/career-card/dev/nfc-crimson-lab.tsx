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
import { NfcCompactCard } from "@/components/career-card/compositions/nfc-compact/nfc-compact-card";
import { CrimsonNightCard } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-card";

const btn = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? "border-stone-900 bg-stone-900 text-white"
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

/** Long-content stress fixture — long names, long values. */
const LONG_CANDIDATE: CompactCandidate = {
  ...DEMO_CANDIDATE_RICH,
  name: "Alexandria Marguerite Williamson-Hartwell",
  headline:
    "Senior Vice President of Artificial Intelligence Product Engineering — Agentic Platforms Division",
  currentRole: "Distinguished Principal AI Product Manager",
  currentCompany: "International Multi-Dimensional Systems Corporation Ltd.",
  skills: [
    "Extremely Long Skill Name With Multiple Words",
    "Large-Scale Distributed Systems Architecture",
    "Cross-Functional Stakeholder Orchestration",
    "Revenue Operations & Forecasting",
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

const DEMO_URL = "https://linkmeu.adelphostech.com/n/demo-career-card";

export function NfcCrimsonLab() {
  const [skin, setSkin] = useState<"light" | "crimson">("crimson");
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
    candidate = DEMO_CANDIDATE_RICH;
    company = DEMO_COMPANY_RICH;
  }
  if (!cover) {
    candidate = without(candidate);
    company = without(company);
  }
  if (!logo) company = noLogo(company);

  const card =
    skin === "crimson" ? (
      <CrimsonNightCard
        active={active}
        onSwitch={setActive}
        candidate={candidate}
        company={company}
        shareUrl={DEMO_URL}
      />
    ) : (
      <NfcCompactCard
        active={active}
        onSwitch={setActive}
        candidate={candidate}
        company={company}
        shareUrl={DEMO_URL}
      />
    );

  return (
    <div
      className={`min-h-dvh transition-colors ${
        skin === "crimson" ? "bg-stone-950" : "bg-stone-100"
      }`}
    >
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur ${
          skin === "crimson"
            ? "border-white/10 bg-stone-950/90"
            : "border-stone-200/60 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <span
            className={`text-sm font-black ${
              skin === "crimson" ? "text-white" : "text-stone-900"
            }`}
          >
            NFC Compact — Crimson Night
          </span>
          <span
            className={`text-xs ${
              skin === "crimson" ? "text-stone-500" : "text-stone-400"
            }`}
          >
            dev-only · skin lab · synthetic data
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSkin("light")}
              className={btn(skin === "light")}
            >
              Passport Light
            </button>
            <button
              type="button"
              onClick={() => setSkin("crimson")}
              className={btn(skin === "crimson")}
            >
              Crimson Night
            </button>
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
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-8 sm:py-12">{card}</main>
    </div>
  );
}
