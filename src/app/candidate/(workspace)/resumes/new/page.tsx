import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateResumeForm } from "@/components/candidate/resumes/create-form";
import { getCandidateResumes } from "@/server/candidates/resumes";

export const metadata = { title: "Create Resume — RoleRace" };

export default async function NewResumePage() {
  const { targetRoleSuggestions, resumeReady } = await getCandidateResumes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
          Create a new resume
        </h1>
        <p className="mt-1.5 text-sm text-stone-600">
          Choose your target and a professional template.
        </p>
      </div>

      {resumeReady ? (
        <CreateResumeForm targetRoleSuggestions={targetRoleSuggestions} />
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-stone-900">
            Your Career Profile needs more information
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
            Complete your career profile before creating a resume.
          </p>
          <Link
            href="/candidate/profile"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <ArrowLeft className="size-4 rotate-180" aria-hidden />
            Complete Career Profile
          </Link>
        </div>
      )}
    </div>
  );
}
