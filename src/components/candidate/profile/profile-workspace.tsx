"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

import type { MasterCareerProfileData } from "@/lib/master-career-profile-schema";

import {
  BasicsSection,
  CertificationsSection,
  EducationSection,
  LanguagesSection,
  ProjectsSection,
  SkillsSection,
  WorkSection,
} from "./sections";

const SECTIONS = [
  { key: "basics", label: "Basics" },
  { key: "work", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function sectionState(
  profile: MasterCareerProfileData,
  key: SectionKey,
  persisted: boolean,
) {
  switch (key) {
    case "basics": {
      const b = profile.basics;
      if (!persisted && (b.fullName || b.email || b.summary)) {
        // Candidate-derived in-memory draft — nothing saved yet.
        return "prefilled";
      }
      return b.fullName || b.email || b.summary ? "added" : "empty";
    }
    default: {
      const items = profile[key] as unknown[];
      return items.length > 0 ? `${items.length} added` : "empty";
    }
  }
}

export function CareerProfileWorkspace({
  profile,
  resumeReady,
  profilePersisted,
}: {
  profile: MasterCareerProfileData;
  resumeReady: boolean;
  profilePersisted: boolean;
}) {
  const [active, setActive] = useState<SectionKey>("basics");

  const editors: Record<SectionKey, React.ReactNode> = {
    basics: <BasicsSection basics={profile.basics} />,
    work: <WorkSection work={profile.work} />,
    education: <EducationSection education={profile.education} />,
    skills: <SkillsSection skills={profile.skills} />,
    projects: <ProjectsSection projects={profile.projects} />,
    certifications: (
      <CertificationsSection certifications={profile.certifications} />
    ),
    languages: <LanguagesSection languages={profile.languages} />,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Career Profile
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            Build your career story once. RoleRace uses this profile when you
            create resumes.
          </p>
        </div>
        <span
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            resumeReady
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 ring-inset"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          {resumeReady
            ? "Resume ready"
            : "Add more career information before creating a resume"}
        </span>
      </div>

      {/* section navigation */}
      <nav aria-label="Profile sections" className="lg:flex lg:gap-8">
        <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:w-48 lg:shrink-0 lg:flex-col lg:gap-1 lg:overflow-visible">
          {SECTIONS.map((s) => {
            const state = sectionState(profile, s.key, profilePersisted);
            const isActive = s.key === active;
            return (
              <li key={s.key} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActive(s.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-600/20 ring-inset"
                      : "font-medium text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {state === "empty" || state === "prefilled" ? (
                      <Circle
                        className={`size-4 ${isActive ? "text-emerald-600" : "text-stone-300"}`}
                        aria-hidden
                      />
                    ) : (
                      <CheckCircle2
                        className={`size-4 ${isActive ? "text-emerald-700" : "text-emerald-600"}`}
                        aria-hidden
                      />
                    )}
                    {s.label}
                  </span>
                  <span
                    className={`text-[11px] whitespace-nowrap ${
                      isActive ? "text-emerald-700" : "text-stone-400"
                    }`}
                  >
                    {state === "empty"
                      ? "Not started"
                      : state === "added"
                        ? "Added"
                        : state === "prefilled"
                          ? "Prefilled"
                          : state}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* editor panel */}
        <div className="mt-6 min-w-0 flex-1 lg:mt-0">{editors[active]}</div>
      </nav>
    </div>
  );
}
