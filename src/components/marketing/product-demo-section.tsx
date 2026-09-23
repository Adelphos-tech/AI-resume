"use client";

import {
  FileText,
  Globe2,
  LayoutTemplate,
  Play,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

export function ProductDemoSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="demo" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* video poster */}
        <div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="group relative block w-full overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 shadow-xl shadow-emerald-900/20 transition-shadow hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
          >
            <div className="flex aspect-video flex-col items-center justify-center gap-4 p-8">
              {/* faint resume lines backdrop */}
              <div
                aria-hidden
                className="absolute inset-8 space-y-3 opacity-15"
              >
                <div className="h-2 w-1/3 rounded-full bg-emerald-200" />
                <div className="h-1.5 w-1/2 rounded-full bg-white" />
                <div className="h-1.5 w-2/3 rounded-full bg-white" />
                <div className="h-1.5 w-1/4 rounded-full bg-emerald-200" />
                <div className="h-1.5 w-full rounded-full bg-white" />
                <div className="h-1.5 w-3/5 rounded-full bg-white" />
                <div className="h-1.5 w-4/5 rounded-full bg-white" />
              </div>
              <span className="relative flex size-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
                <Play
                  className="ml-0.5 size-7 fill-emerald-800 text-emerald-800"
                  aria-hidden
                />
              </span>
              <span className="relative text-center">
                <span className="block text-lg font-semibold text-white">
                  See RoleRace in action
                </span>
                <span className="mt-1 block text-sm text-emerald-100/80">
                  From career profile to polished resume.
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* capabilities */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Everything you need for a stronger career
            </h2>
            <p className="max-w-md text-stone-600">
              One structured career profile becomes the source for every
              targeted resume you create.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <li key={c.title} className="flex items-start gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                  <c.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-500">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product demo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Play className="size-5" />
            </div>
            <p className="mt-4 font-semibold text-stone-900">
              Product demo video coming soon
            </p>
            <p className="mt-1.5 text-sm text-stone-500">
              We&rsquo;re preparing a walkthrough of the full RoleRace workflow.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <X className="size-4" /> Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const CAPABILITIES = [
  {
    icon: UserRound,
    title: "Career Profile",
    text: "A structured master profile of your full experience.",
  },
  {
    icon: FileText,
    title: "Targeted Resumes",
    text: "Role- and country-specific variants from one source.",
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    text: "Four polished, ATS-conscious resume designs.",
  },
  {
    icon: Sparkles,
    title: "AI Resume Review",
    text: "On-demand qualitative feedback when you ask for it.",
  },
  {
    icon: Globe2,
    title: "PDF & DOCX",
    text: "Clean exports ready for real applications.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    text: "Your career data stays in your control.",
  },
];
