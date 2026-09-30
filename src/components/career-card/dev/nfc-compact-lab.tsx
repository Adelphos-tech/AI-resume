"use client";

import { useState } from "react";
import {
  DEMO_CANDIDATE_RICH,
  DEMO_CANDIDATE_SPARSE,
  DEMO_COMPANY_RICH,
  DEMO_COMPANY_SPARSE,
} from "@/components/career-card/dev/nfc-compact-data";
import { NfcCompactCard } from "@/components/career-card/compositions/nfc-compact/nfc-compact-card";

const btn = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
  }`;

export function NfcCompactLab() {
  const [active, setActive] = useState<"candidate" | "company">("candidate");
  const [density, setDensity] = useState<"rich" | "sparse">("rich");
  return (
    <div className="min-h-dvh bg-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm font-black text-stone-900">
            NFC Compact Template
          </span>
          <span className="text-xs text-stone-400">
            dev-only · dual profile
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {(["rich", "sparse"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setDensity(v)}
                className={btn(density === v)}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-8 sm:py-12">
        <NfcCompactCard
          active={active}
          onSwitch={setActive}
          candidate={
            density === "rich" ? DEMO_CANDIDATE_RICH : DEMO_CANDIDATE_SPARSE
          }
          company={density === "rich" ? DEMO_COMPANY_RICH : DEMO_COMPANY_SPARSE}
        />
        <p className="mt-10 text-center text-xs text-stone-400">
          Synthetic demo data · development only
        </p>
      </main>
    </div>
  );
}
