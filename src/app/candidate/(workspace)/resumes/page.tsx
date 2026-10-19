import {
  ArrowRight,
  FilePlus2,
  FileText,
  FileUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { ResumeMiniPreview } from "@/components/resume/resume-mini-preview";
import {
  RESUME_TEMPLATES,
  resumeDataSchema,
  type ResumeTemplateKey,
} from "@/lib/resume-schema";
import { getCandidateResumes } from "@/server/candidates/resumes";

export const metadata = { title: "Resumes — LinkMeU" };

export default async function CandidateResumesPage() {
  const { list, resumeReady } = await getCandidateResumes();
  const variants = list.success ? list.variants : [];

  // Grid adapts to real content: ≤2 resumes get a larger two-column
  // treatment so a single card never floats alone in the 6A0 canvas.
  const gridClass =
    variants.length <= 2
      ? "grid gap-5 sm:grid-cols-2"
      : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Resumes
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            Create and manage targeted resumes for different roles and markets.
          </p>
        </div>
        <Link
          href="/candidate/resumes/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          <FilePlus2 className="size-4" aria-hidden />
          Create resume
        </Link>
      </div>

      {!list.success ? (
        <p role="alert" className="text-sm text-red-600">
          {list.message}
        </p>
      ) : variants.length === 0 ? (
        resumeReady ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <FileText className="mx-auto size-9 text-stone-300" aria-hidden />
            <p className="mt-3 text-base font-semibold text-stone-900">
              Create your first resume
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
              Use your Career Profile to build a targeted resume for a role and
              country.
            </p>
            <Link
              href="/candidate/resumes/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <FilePlus2 className="size-4" aria-hidden />
              Create resume
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <FileText className="mx-auto size-9 text-stone-300" aria-hidden />
            <p className="mt-3 text-base font-semibold text-stone-900">
              Complete your Career Profile first
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
              Add your career information or import an existing resume before
              creating a targeted resume.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/candidate/profile/import"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <FileUp className="size-4" aria-hidden />
                Import existing resume
              </Link>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:text-stone-900"
              >
                Career Profile
              </Link>
            </div>
          </div>
        )
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
            {variants.length} resume{variants.length === 1 ? "" : "s"}
          </p>
          <ul className={gridClass}>
            {variants.map((v, index) => {
              const parsed = resumeDataSchema.safeParse(v.resumeData);
              return (
                <li key={v.id}>
                  <div className="group relative h-full rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-emerald-600/30 hover:shadow-sm">
                    <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white">
                      <div
                        className={
                          variants.length === 1
                            ? "aspect-[5/4] sm:aspect-[4/3]"
                            : "aspect-[4/3]"
                        }
                      >
                        {parsed.success ? (
                          <ResumeMiniPreview
                            templateKey={v.templateKey}
                            resumeData={parsed.data}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-emerald-700">
                            <FileText className="size-7" aria-hidden />
                          </span>
                        )}
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-600/20 ring-inset">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="truncate text-base font-semibold text-stone-900">
                        {v.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-stone-700">
                        {v.targetRole}
                      </p>
                      <p className="mt-2 flex items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
                        <span className="truncate">
                          {v.targetCountry} ·{" "}
                          {RESUME_TEMPLATES[v.templateKey as ResumeTemplateKey]
                            ?.name ?? v.templateKey}
                        </span>
                        <span className="ml-auto shrink-0 text-stone-400">
                          {v.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        href={`/candidate/resumes/${v.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors after:absolute after:inset-0 hover:bg-emerald-800"
                      >
                        View resume
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/candidate/ai-review/${v.id}`}
                        className="relative z-10 inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:text-emerald-800"
                      >
                        <Sparkles className="size-4" aria-hidden />
                        AI Review
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
