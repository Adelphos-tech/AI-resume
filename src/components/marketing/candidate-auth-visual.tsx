import {
  CheckCircle2,
  Circle,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const STEPS = [
  { label: "Profile", state: "done" },
  { label: "Career Goals", state: "done" },
  { label: "Generate Resume", state: "active" },
  { label: "AI Review", state: "todo" },
  { label: "Download / Apply", state: "todo" },
] as const;

/**
 * Display-only product visual for candidate auth pages.
 * Pure presentation — no data, no DB, no Groq.
 */
export function CandidateAuthVisual({
  headline = "Turn your experience into opportunity.",
  note = true,
}: {
  headline?: string;
  note?: boolean;
}) {
  return (
    <div aria-hidden className="w-full max-w-md space-y-8">
      <div className="relative flex items-start gap-5">
        {/* progress card */}
        <div className="w-40 shrink-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-emerald-900/10">
          <ul className="space-y-3">
            {STEPS.map((s) => (
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
        </div>

        {/* resume sheet */}
        <div className="relative flex-1 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-emerald-900/15">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
              AM
            </span>
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded-full bg-stone-700" />
              <div className="h-1.5 w-12 rounded-full bg-emerald-600" />
            </div>
          </div>
          <div className="mt-3 border-t border-stone-200" />
          <div className="mt-2.5 space-y-1.5">
            <div className="h-1.5 w-12 rounded-full bg-emerald-700" />
            <div className="h-1.5 w-full rounded-full bg-stone-300" />
            <div className="h-1.5 w-4/5 rounded-full bg-stone-300" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-14 rounded-full bg-emerald-700" />
            <div className="h-1.5 w-full rounded-full bg-stone-300" />
            <div className="h-1.5 w-3/4 rounded-full bg-stone-300" />
            <div className="h-1.5 w-5/6 rounded-full bg-stone-300" />
          </div>

          {/* AI chip overlapping resume bottom edge */}
          <div className="absolute -bottom-4 right-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-xl">
            <span className="flex size-6 items-center justify-center rounded-md bg-emerald-700 text-white">
              <Sparkles className="size-3" />
            </span>
            <span className="text-[10px] font-semibold text-stone-800">
              AI Review — 3 suggestions
            </span>
          </div>
        </div>

        {/* decorative note floating above resume */}
        {note && (
          <p className="absolute -top-8 right-2 rotate-[-3deg] font-serif text-xs text-stone-500 italic">
            Same profile.
            <br />
            New opportunities.
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-6">
        <p className="text-xl font-bold tracking-tight text-emerald-950">
          {headline}
        </p>
        <TrendingUp className="size-5 shrink-0 text-emerald-600" />
      </div>
    </div>
  );
}
