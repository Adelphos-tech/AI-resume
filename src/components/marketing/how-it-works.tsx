import {
  Download,
  FileText,
  Sparkles,
  Target,
  UserPlus,
  UserRound,
} from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    num: "01",
    title: "Create Account",
    text: "Start your LinkMeU workspace in minutes.",
  },
  {
    icon: UserRound,
    num: "02",
    title: "Build Profile",
    text: "Capture your experience once in a structured career profile.",
  },
  {
    icon: Target,
    num: "03",
    title: "Choose Target",
    text: "Pick the role and country you're aiming for.",
  },
  {
    icon: FileText,
    num: "04",
    title: "Generate Resume",
    text: "Produce a polished resume in the template you choose.",
  },
  {
    icon: Sparkles,
    num: "05",
    title: "Review with AI",
    text: "Ask for qualitative feedback on evidence and alignment.",
  },
  {
    icon: Download,
    num: "06",
    title: "Download & Apply",
    text: "Export PDF or DOCX and send it to real employers.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-14 px-6">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            From experience to application, in six steps
          </h2>
          <p className="text-stone-600">
            A deliberate workflow that keeps your career story consistent across
            every application.
          </p>
        </div>

        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {/* connecting line on desktop */}
          <div
            aria-hidden
            className="absolute top-6 right-[8%] left-[8%] hidden border-t-2 border-dashed border-emerald-600/20 lg:block"
          />
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="relative flex gap-4 lg:flex-col lg:gap-0"
            >
              <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600/25 bg-white text-emerald-700 shadow-sm lg:mx-auto">
                <s.icon className="size-5" aria-hidden />
              </div>
              <div className="lg:mt-4 lg:text-center">
                <p className="text-[11px] font-bold tracking-widest text-emerald-600">
                  {s.num}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">
                  {s.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
