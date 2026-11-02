import { FileUp } from "lucide-react";
import Link from "next/link";

import { CareerProfileWorkspace } from "@/components/candidate/profile/profile-workspace";
import {
  PROFILE_SECTION_KEYS,
  type ProfileSectionKey,
} from "@/lib/ai-review-edit-target";
import {
  createInitialMasterCareerProfileFromCandidate,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { prisma } from "@/server/db";
import { getCandidateProfile } from "@/server/candidates/career-profile";

export const metadata = { title: "Career Profile — LinkMeU" };

const ENTRY_SECTIONS = [
  "work",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
] as const;

export default async function CandidateProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { candidate, result } = await getCandidateProfile();

  if (!result.success) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
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

  // Optional deep link (e.g. from an AI Review finding): open a specific
  // section and focus the canonical source entry. Values are validated
  // against the profile actually loaded for this session's candidate.
  const params = await searchParams;
  const rawSection = Array.isArray(params.section)
    ? params.section[0]
    : params.section;
  const rawEntry = Array.isArray(params.entry) ? params.entry[0] : params.entry;
  const initialSection = PROFILE_SECTION_KEYS.includes(
    rawSection as ProfileSectionKey,
  )
    ? (rawSection as ProfileSectionKey)
    : undefined;
  const entrySection = ENTRY_SECTIONS.find((s) => s === initialSection);
  const focusEntryId =
    initialSection && entrySection && rawEntry ? rawEntry : undefined;
  const focusEntryMissing = Boolean(
    focusEntryId &&
    entrySection &&
    !(profile[entrySection] as { id: string }[]).some(
      (e) => e.id === focusEntryId,
    ),
  );

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
        initialSection={initialSection}
        focusEntryId={focusEntryMissing ? undefined : focusEntryId}
        focusEntryMissing={focusEntryMissing}
      />
    </div>
  );
}
