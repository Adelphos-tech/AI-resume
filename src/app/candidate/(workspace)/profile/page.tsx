import { FileUp } from "lucide-react";
import Link from "next/link";

import { CareerProfileWorkspace } from "@/components/candidate/profile/profile-workspace";
import {
  createInitialMasterCareerProfileFromCandidate,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import { getCandidateProfile } from "@/server/candidates/career-profile";

export const metadata = { title: "Career Profile — RoleRace" };

export default async function CandidateProfilePage() {
  const { candidate, result } = await getCandidateProfile();

  if (!result.success) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Career Profile
        </h1>
        <p role="alert" className="text-sm text-red-600">
          {result.message}
        </p>
      </div>
    );
  }

  // No profile row → deterministic in-memory draft derived from the
  // owned Candidate. Nothing is persisted until an actual save.
  const owned = await prisma.candidate.findUniqueOrThrow({
    where: { id: candidate.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      location: true,
      linkedinUrl: true,
    },
  });
  const profile =
    result.profile ?? createInitialMasterCareerProfileFromCandidate(owned);

  const resumeReady =
    resumeReadyMasterCareerProfileSchema.safeParse(profile).success;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4">
        <p className="max-w-xl text-sm text-stone-600">
          Already have a resume? Upload a PDF or DOCX and we&apos;ll extract the
          text so you can review it before adding anything to your Career
          Profile.
        </p>
        <Link
          href="/candidate/profile/import"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          <FileUp className="size-4" aria-hidden />
          Import from existing resume
        </Link>
      </div>
      <CareerProfileWorkspace
        profile={profile}
        resumeReady={resumeReady}
        profilePersisted={result.profile !== null}
      />
    </div>
  );
}
