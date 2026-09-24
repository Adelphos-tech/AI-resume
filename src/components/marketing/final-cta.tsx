import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section id="final-cta" className="px-6 pb-20 md:pb-28">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-emerald-950 px-6 py-16 text-center md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, rgba(52,211,153,0.18), transparent 70%)",
          }}
        />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Ready to build your career?
          </h2>
          <p className="mx-auto max-w-lg text-lg text-emerald-100/75">
            Turn your experience into targeted, professional resumes with
            RoleRace.
          </p>
          <a
            href="/candidate/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-8 py-3.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/25 transition-colors hover:bg-emerald-300"
          >
            Get Started
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="text-xs text-emerald-100/50">
            Candidate accounts are opening next — talk to us about access.
          </p>
        </div>
      </div>
    </section>
  );
}
