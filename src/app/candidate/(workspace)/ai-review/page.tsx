import { FilePlus2, Sparkles } from "lucide-react";
import Link from "next/link";

import { RESUME_TEMPLATES, type ResumeTemplateKey } from "@/lib/resume-schema";
import { listCandidateResumeVariantsCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "AI Review — LinkMeU" };

export default async function CandidateAiReviewPage() {
  const { candidate } = await requireCandidateSession();
  const list = await listCandidateResumeVariantsCore(candidate.id);
  const variants = list.success ? list.variants : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          AI Review
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Get focused feedback on one of your saved resumes.
        </p>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-stone-900">
            No resumes to review yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
            Create a resume first, then come back for an AI review.
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {variants.map((v) => (
            <section
              key={v.id}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <h2 className="text-sm font-semibold text-stone-900">{v.name}</h2>
              <p className="mt-0.5 text-xs text-stone-500">
                {v.targetRole} · {v.targetCountry}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {RESUME_TEMPLATES[v.templateKey as ResumeTemplateKey]?.name ??
                  v.templateKey}
                {" · "}
                {v.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <Link
                href={`/candidate/ai-review/${v.id}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Sparkles className="size-4" aria-hidden />
                Review resume
              </Link>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
