"use client";

import { useState } from "react";
import {
  CAREER_MODE_RECIPES,
  resolveCareerMode,
  type CareerModeId,
  type ModeAbsence,
} from "@/components/career-card/dev/career-mode-recipes";
import { ModeCinematicCard } from "@/components/career-card/dev/mode-cinematic-card";

const ABSENCES: { id: ModeAbsence; label: string }[] = [
  { id: "linkedin", label: "No LinkedIn" },
  { id: "github", label: "No GitHub" },
  { id: "website", label: "No Website" },
  { id: "resume", label: "No Resume" },
  { id: "projects", label: "No Projects" },
  { id: "credentials", label: "No Credentials" },
];

const btn = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
  }`;

export function CareerModesLab() {
  const [mode, setMode] = useState<CareerModeId>("general");
  const [absent, setAbsent] = useState<Set<ModeAbsence>>(new Set());
  const recipe = CAREER_MODE_RECIPES.find((r) => r.id === mode)!;
  const view = resolveCareerMode(recipe, absent);
  const toggle = (id: ModeAbsence) =>
    setAbsent((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <div className="min-h-dvh bg-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-black text-stone-900">
              Career Modes
            </span>
            <span className="text-xs text-stone-400">
              dev-only · one master profile
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {CAREER_MODE_RECIPES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setMode(r.id)}
                  className={btn(mode === r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 sm:grid-cols-3">
            <p>
              <span className="font-semibold text-stone-800">Purpose</span>
              <br />
              {recipe.description}
            </p>
            <p>
              <span className="font-semibold text-stone-800">Audience</span>
              <br />
              {recipe.audience}
            </p>
            <p>
              <span className="font-semibold text-stone-800">Primary CTA</span>
              <br />
              {view.primaryAction ? view.primaryAction.label : "None available"}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Absence
            </span>
            {ABSENCES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={btn(absent.has(a.id))}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-8">
        <ModeCinematicCard v={view} />
        <p className="mt-10 text-center text-xs text-stone-400">
          Synthetic demo data · development only · same master profile for all
          modes
        </p>
      </main>
    </div>
  );
}
