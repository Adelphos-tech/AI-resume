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
    <CareerProfileWorkspace
      profile={profile}
      resumeReady={resumeReady}
      profilePersisted={result.profile !== null}
    />
  );
}
