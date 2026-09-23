import { CheckCircle2, CircleAlert, Sparkles, ThumbsUp } from "lucide-react";

const BENEFITS = [
  "Role-specific feedback",
  "Exact resume findings",
  "Evidence and skills-gap review",
  "Country-aware presentation guidance",
];

export function AiReviewShowcase() {
  return (
    <section id="ai-review" className="bg-emerald-950 py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        {/* mockup: resume with AI callouts */}
        <div aria-hidden className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100/10 bg-white p-6 shadow-2xl">
            {/* subtle scan glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-400/15 to-transparent" />
            <div className="mb-3 space-y-1.5">
              <div className="h-2 w-2/5 rounded-full bg-stone-700" />
              <div className="h-1.5 w-3/5 rounded-full bg-stone-300" />
            </div>
            <div className="border-t border-stone-200 pt-3" />

            {/* strong line */}
            <div className="relative mt-1 rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-500/30">
              <div className="h-1.5 w-full rounded-full bg-emerald-800/50" />
              <div className="mt-1 h-1.5 w-4/5 rounded-full bg-emerald-800/30" />
              <span className="absolute -top-2.5 -right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                <ThumbsUp className="size-2.5" /> Strong match
              </span>
            </div>

            <div className="mt-3 space-y-1.5 px-1">
              <div className="h-1.5 w-full rounded-full bg-stone-300" />
              <div className="h-1.5 w-5/6 rounded-full bg-stone-300" />
            </div>

            {/* relevant evidence */}
            <div className="relative mt-3 rounded-lg bg-stone-50 px-3 py-2.5 ring-1 ring-stone-200">
              <div className="h-1.5 w-full rounded-full bg-stone-400" />
              <div className="mt-1 h-1.5 w-3/5 rounded-full bg-stone-300" />
              <span className="absolute -top-2.5 -right-2 flex items-center gap-1 rounded-full bg-stone-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                <CheckCircle2 className="size-2.5" /> Relevant evidence
              </span>
            </div>

            {/* weak line */}
            <div className="relative mt-3 rounded-lg bg-amber-50 px-3 py-2.5 ring-1 ring-amber-500/40">
              <div className="h-1.5 w-full rounded-full bg-amber-700/40" />
              <div className="mt-1 h-1.5 w-2/3 rounded-full bg-amber-700/25" />
              <span className="absolute -top-2.5 -right-2 flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                <CircleAlert className="size-2.5" /> Could strengthen
              </span>
            </div>
          </div>

          {/* floating feedback card */}
          <div className="absolute -right-3 -bottom-5 w-56 rounded-xl border border-emerald-100/10 bg-emerald-900 p-3.5 shadow-2xl max-md:hidden">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-100">
              <Sparkles className="size-3.5" /> AI finding
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-emerald-100/70">
              &ldquo;Shipped 3 releases&rdquo; lacks scope or impact — add a
              concrete outcome.
            </p>
          </div>
        </div>

        {/* copy */}
        <div className="space-y-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-emerald-300 uppercase">
            <Sparkles className="size-3.5" aria-hidden />
            AI-powered insights
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Get detailed, actionable feedback with AI
          </h2>

          <p className="max-w-md leading-relaxed text-emerald-100/75">
            Review your resume against your selected role and country and see
            what is working, what could be strengthened, and what evidence may
            be missing.
          </p>

          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-center gap-3 text-sm text-emerald-50"
              >
                <CheckCircle2
                  className="size-4.5 shrink-0 text-emerald-400"
                  aria-hidden
                />
                {b}
              </li>
            ))}
          </ul>

          <a
            href="#pricing"
            className="inline-block rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/20 transition-colors hover:bg-emerald-300"
          >
            Explore AI Review
          </a>
        </div>
      </div>
    </section>
  );
}
