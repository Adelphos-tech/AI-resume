import { Compass, Globe2, TrendingUp } from "lucide-react";

const AUDIENCES = [
  {
    icon: Compass,
    title: "Career Switchers",
    text: "Position transferable experience for a new role without rebuilding your career story from scratch.",
  },
  {
    icon: TrendingUp,
    title: "Experienced Professionals",
    text: "Turn years of experience into focused resumes for different opportunities.",
  },
  {
    icon: Globe2,
    title: "International Applicants",
    text: "Create targeted resumes with role and country context while keeping your core career profile consistent.",
  },
];

export function AudienceSection() {
  return (
    <section className="bg-emerald-50/40 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Built for professionals at every stage
          </h2>
          <p className="text-stone-600">
            Whether you&rsquo;re changing direction, leveling up, or applying
            across borders.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                <a.icon className="size-5" aria-hidden />
              </span>
              <p className="mt-4 font-semibold text-stone-900">{a.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {a.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
