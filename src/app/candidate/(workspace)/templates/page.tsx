import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TemplateMiniPreview } from "@/components/candidate/templates/template-mini-preview";
import { RESUME_TEMPLATES } from "@/lib/resume-schema";

export const metadata = { title: "Templates — LinkMeU" };

export default function TemplatesPage() {
  const templates = Object.values(RESUME_TEMPLATES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Templates
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Choose a professional resume design for your next opportunity.
        </p>
        <p className="mt-1 text-xs font-medium text-stone-500">
          {templates.length} professional templates
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <section
            key={t.key}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-stone-300"
          >
            <div className="border-b border-stone-100 bg-stone-50/60 p-3">
              <div className="rounded-md border border-stone-200 bg-white shadow-sm">
                <TemplateMiniPreview templateKey={t.key} />
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-sm font-semibold text-stone-900">{t.name}</h2>
              <p className="mt-0.5 text-xs font-medium text-emerald-800">
                {t.category}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                {t.description}
              </p>
              <Link
                href={`/candidate/resumes/new?template=${t.key}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Use template
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
