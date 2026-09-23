import { Check } from "lucide-react";

const PACKAGES = [
  {
    name: "Starter Lap",
    tagline: "Your first professional resume",
    features: [
      "Structured career profile",
      "One professional resume",
      "All four templates",
      "PDF & DOCX export",
    ],
    emphasized: false,
  },
  {
    name: "Career Grid",
    tagline: "Direction plus tailored resumes",
    features: [
      "Everything in Starter Lap",
      "Career analysis",
      "Role & direction guidance",
      "Multiple tailored resumes",
      "AI resume review",
    ],
    emphasized: true,
  },
  {
    name: "Pole Position",
    tagline: "High-touch career targeting",
    features: [
      "Everything in Career Grid",
      "Premium role targeting",
      "Opportunity research support",
      "Priority guidance",
    ],
    emphasized: false,
  },
];

export function PackagesSection() {
  return (
    <section id="pricing" className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Packages for every stage of the race
          </h2>
          <p className="text-stone-600">
            Choose the level of support that fits where your career is headed.
          </p>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col rounded-2xl p-7 ${
                p.emphasized
                  ? "border-2 border-emerald-600 bg-white shadow-xl shadow-emerald-900/10 lg:-my-3 lg:py-10"
                  : "border border-stone-200 bg-white shadow-sm"
              }`}
            >
              <p className="text-lg font-bold text-stone-900">{p.name}</p>
              <p className="mt-1 text-sm text-stone-500">{p.tagline}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-stone-700"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#final-cta"
                className={`mt-8 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                  p.emphasized
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "border border-stone-300 text-stone-700 hover:border-emerald-600/40 hover:bg-emerald-50"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
