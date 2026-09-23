import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const MARKERS = [
  "Professional templates",
  "AI-powered review",
  "Targeted for global opportunities",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* soft mint ambient glow behind/right of the hero visual */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 78% 35%, rgba(167,243,208,0.35), transparent 70%), radial-gradient(35% 40% at 10% 70%, rgba(209,250,229,0.25), transparent 70%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/15 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-emerald-800 uppercase">
            Your career. Ahead of the curve.
          </span>

          <h1 className="text-5xl leading-[1.08] font-bold tracking-tight text-stone-900 md:text-6xl">
            Build a <span className="text-emerald-700">career-ready</span>{" "}
            resume, not just another&nbsp;CV.
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-stone-600">
            RoleRace helps you create tailored, professional resumes using your
            structured career profile — with AI-powered feedback to make every
            application count.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 transition-all hover:bg-emerald-800 hover:shadow-lg"
            >
              Get Started Free
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white py-2 pr-5 pl-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
                <Play
                  className="ml-0.5 size-3.5 fill-emerald-800 text-emerald-800"
                  aria-hidden
                />
              </span>
              See how it works
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {MARKERS.map((m) => (
              <li
                key={m}
                className="flex items-center gap-1.5 text-sm text-stone-500"
              >
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

const PROGRESS_STEPS = [
  { label: "Profile", state: "done" },
  { label: "Career Goals", state: "done" },
  { label: "Generate Resume", state: "active" },
  { label: "AI Review", state: "todo" },
  { label: "Download", state: "todo" },
] as const;

function HeroVisual() {
  return (
    <div
      aria-hidden
      className="relative mx-auto flex w-full max-w-lg items-start gap-4 lg:max-w-none"
    >
      {/* slim progress card */}
      <div className="w-36 shrink-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-emerald-900/8 max-sm:hidden">
        <ul className="space-y-3">
          {PROGRESS_STEPS.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              {s.state === "done" ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : s.state === "active" ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                  <FileText className="size-2.5 text-white" />
                </span>
              ) : (
                <Circle className="size-4 shrink-0 text-stone-300" />
              )}
              <span
                className={`text-[11px] leading-tight font-medium ${
                  s.state === "active"
                    ? "text-emerald-800"
                    : s.state === "done"
                      ? "text-stone-600"
                      : "text-stone-400"
                }`}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-stone-100 pt-3">
          <TrendingUp className="size-4 text-emerald-600" />
          <p className="mt-1.5 text-[10px] leading-snug text-stone-500">
            One profile.
            <br />
            Multiple opportunities.
          </p>
        </div>
      </div>

      {/* resume document — dominant element */}
      <div className="relative flex-1">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl shadow-emerald-900/12">
          {/* person header */}
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              AM
            </span>
            <div>
              <div className="h-2.5 w-28 rounded-full bg-stone-700" />
              <div className="mt-1.5 h-1.5 w-20 rounded-full bg-emerald-600" />
            </div>
          </div>
          <div className="mt-2.5 flex gap-2">
            <div className="h-1.5 w-14 rounded-full bg-stone-300" />
            <div className="h-1.5 w-16 rounded-full bg-stone-300" />
            <div className="h-1.5 w-12 rounded-full bg-stone-300" />
          </div>
          <div className="mt-4 border-t border-stone-200" />

          {/* Summary */}
          <div className="mt-3">
            <div className="h-2 w-16 rounded-full bg-emerald-700" />
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-stone-300" />
              <div className="h-1.5 w-5/6 rounded-full bg-stone-300" />
            </div>
          </div>

          {/* Experience */}
          <div className="mt-4">
            <div className="h-2 w-20 rounded-full bg-emerald-700" />
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-stone-300" />
              <div className="h-1.5 w-full rounded-full bg-stone-300" />
              <div className="h-1.5 w-4/5 rounded-full bg-stone-300" />
              <div className="h-1.5 w-2/3 rounded-full bg-stone-300" />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <div className="h-2 w-12 rounded-full bg-emerald-700" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[10, 14, 8, 12, 9, 11].map((w, i) => (
                <div
                  key={i}
                  className="h-3.5 rounded-md bg-emerald-50 ring-1 ring-emerald-600/15"
                  style={{ width: `${w * 4 + 18}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* floating AI chips */}
        <div className="absolute -top-3 -right-3 rounded-full border border-emerald-600/15 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-800 shadow-md max-sm:hidden">
          Well aligned with target role
        </div>
        <div className="absolute top-1/3 -right-5 rounded-full border border-emerald-600/15 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-800 shadow-md max-lg:hidden">
          Stronger impact statement
        </div>
        <div className="absolute bottom-16 -right-4 rounded-full border border-amber-500/20 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800 shadow-md max-lg:hidden">
          Consider adding key skills
        </div>

        {/* AI Review card */}
        <div className="absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-xl max-sm:hidden">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold text-stone-900">AI Review</p>
            <p className="text-[10px] text-stone-500">3 suggestions</p>
          </div>
        </div>

        {/* handwritten-style note + curved arrow */}
        <div className="absolute -top-16 right-6 rotate-[-4deg] text-center max-lg:hidden">
          <p className="font-serif text-sm text-stone-500 italic">
            Same profile.
            <br />
            New opportunities.
          </p>
          <svg
            className="mx-auto mt-1"
            width="40"
            height="26"
            viewBox="0 0 40 26"
            fill="none"
          >
            <path
              d="M34 3C24 6 12 10 8 22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-stone-400"
            />
            <path
              d="M4 18l4 4 4-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-400"
            />
          </svg>
        </div>
      </div>

      {/* download chip, bottom-right of composition */}
      <div className="absolute -right-3 -bottom-5 hidden items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-stone-600 shadow-lg lg:flex">
        <Download className="size-3.5 text-emerald-600" />
        PDF & DOCX ready
      </div>
    </div>
  );
}
