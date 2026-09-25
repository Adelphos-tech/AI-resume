import { FilePlus2, FileText } from "lucide-react";
import Link from "next/link";

import { ResumeMiniPreview } from "@/components/resume/resume-mini-preview";
import {
  RESUME_TEMPLATES,
  resumeDataSchema,
  type ResumeTemplateKey,
} from "@/lib/resume-schema";
import { getCandidateResumes } from "@/server/candidates/resumes";

export const metadata = { title: "Resumes — RoleRace" };

export default async function CandidateResumesPage() {
  const { list } = await getCandidateResumes();
  const variants = list.success ? list.variants : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Resumes
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Create and manage targeted resumes from your career profile.
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
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <FileText className="mx-auto size-9 text-stone-300" aria-hidden />
          <p className="mt-3 text-base font-semibold text-stone-900">
            No resumes yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-stone-500">
            Create your first targeted resume from your career profile.
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
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {variants.map((v) => {
            const parsed = resumeDataSchema.safeParse(v.resumeData);
            return (
              <li key={v.id}>
                <Link
                  href={`/candidate/resumes/${v.id}`}
                  className="block rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-600/30 hover:shadow-sm"
                >
                  <div className="h-40 overflow-hidden rounded-lg border border-stone-200 bg-white">
                    {parsed.success ? (
                      <ResumeMiniPreview
                        templateKey={v.templateKey}
                        resumeData={parsed.data}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-emerald-700">
                        <FileText className="size-6" aria-hidden />
                      </span>
                    )}
                  </div>
                  <p className="mt-4 truncate text-sm font-semibold text-stone-900">
                    {v.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {v.targetRole} · {v.targetCountry}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <p className="text-xs font-medium text-stone-600">
                      {RESUME_TEMPLATES[v.templateKey as ResumeTemplateKey]
                        ?.name ?? v.templateKey}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {v.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    View resume →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
