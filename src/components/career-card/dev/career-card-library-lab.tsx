"use client";

import { useState } from "react";
import { CinematicHero } from "@/components/career-card/compositions/cinematic-hero";
import { SplitHero } from "@/components/career-card/compositions/split-hero";
import { EditorialHero } from "@/components/career-card/compositions/editorial-hero";
import { MinimalBentoHero } from "@/components/career-card/compositions/minimal-bento-hero";
import {
  DEMO_CAREER_PROFILE,
  type DemoMedia,
} from "@/components/career-card/dev/demo-career-profile";

const COMPS = [
  { id: "cinematic", label: "Cinematic", bg: "bg-[#0c0a09]" },
  { id: "split", label: "Split", bg: "bg-stone-100" },
  { id: "editorial", label: "Editorial", bg: "bg-stone-50" },
  { id: "bento", label: "Minimal/Bento", bg: "bg-neutral-100" },
] as const;

const MEDIAS: { id: DemoMedia; label: string }[] = [
  { id: "landscape", label: "Landscape" },
  { id: "subject", label: "Subject" },
  { id: "none", label: "No cover" },
];

const btn = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
    on
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
  }`;

export function CareerCardLibraryLab() {
  const [comp, setComp] = useState<(typeof COMPS)[number]["id"]>("cinematic");
  const [media, setMedia] = useState<DemoMedia>("landscape");
  const d = DEMO_CAREER_PROFILE;
  const pageBg =
    comp === "cinematic"
      ? "bg-[#0c0a09] bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(167,139,250,.20),transparent)]"
      : COMPS.find((c) => c.id === comp)!.bg;
  return (
    <div className={`min-h-dvh ${pageBg}`}>
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm font-black text-stone-900">
            Career Card Library
          </span>
          <span className="text-xs text-stone-400">dev-only · hero stage</span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Comp
            </span>
            {COMPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setComp(c.id)}
                className={btn(comp === c.id)}
              >
                {c.label}
              </button>
            ))}
            <span className="ml-3 mr-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Media
            </span>
            {MEDIAS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMedia(m.id)}
                className={btn(media === m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-8 sm:py-12">
        {comp === "cinematic" && <CinematicHero d={d} media={media} />}
        {comp === "split" && <SplitHero d={d} media={media} />}
        {comp === "editorial" && <EditorialHero d={d} media={media} />}
        {comp === "bento" && <MinimalBentoHero d={d} media={media} />}
        <p className="mt-10 text-center text-xs text-stone-400">
          Synthetic demo data · development only
        </p>
      </main>
    </div>
  );
}
