import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";

import { CreateResumeForm } from "@/components/candidate/resumes/create-form";
import { RESUME_TEMPLATES } from "@/lib/resume-schema";
import { getCandidateResumes } from "@/server/candidates/resumes";

export const metadata = { title: "Create Resume — LinkMeU" };

export default async function NewResumePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const [{ template }, { targetRoleSuggestions, resumeReady }] =
    await Promise.all([searchParams, getCandidateResumes()]);

  // Optional gallery preselection — validated against the registry;
  // anything unknown falls back to the existing default.
  const initialTemplate =
    template && Object.hasOwn(RESUME_TEMPLATES, template)
      ? template
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Create resume
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Create a targeted resume from your Career Profile.
        </p>
      </div>

      {resumeReady ? (
        <CreateResumeForm
          targetRoleSuggestions={targetRoleSuggestions}
          initialTemplate={initialTemplate}
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-stone-900">
            Your Career Profile needs more information before you can create a
            resume
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
            Import an existing resume or complete your profile manually first.
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
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:text-stone-900"
            >
              <ArrowLeft className="size-4 rotate-180" aria-hidden />
              Career Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
