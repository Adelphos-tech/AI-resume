import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CareerProfileBasicsForm } from "@/components/admin/career-profile-basics-form";
import { CareerProfileCertificationsForm } from "@/components/admin/career-profile-certifications-form";
import { CareerProfileEducationForm } from "@/components/admin/career-profile-education-form";
import { CareerProfileLanguagesForm } from "@/components/admin/career-profile-languages-form";
import { CareerProfileProjectsForm } from "@/components/admin/career-profile-projects-form";
import { CareerProfileSkillsForm } from "@/components/admin/career-profile-skills-form";
import { CareerProfileWorkForm } from "@/components/admin/career-profile-work-form";
import { Button } from "@/components/ui/button";
import {
  createInitialMasterCareerProfileFromCandidate,
  resumeReadyMasterCareerProfileSchema,
} from "@/lib/master-career-profile-schema";
import { getMasterCareerProfile } from "@/server/career-profile/master-career-profile";
import { getCandidate } from "@/server/candidates/get-candidate";
import { requireInternalSession } from "@/server/session";

export default async function CareerProfileEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInternalSession();

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) {
    notFound();
  }

  const profileResult = await getMasterCareerProfile(id);
  if (!profileResult.success) {
    notFound();
  }

  const profile =
    profileResult.profile ??
    createInitialMasterCareerProfileFromCandidate(candidate);

  const resumeReady =
    resumeReadyMasterCareerProfileSchema.safeParse(profile).success;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/candidates/${candidate.id}`}>
          <ArrowLeft />
          Back to Candidate
        </Link>
      </Button>

      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Career Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          {candidate.firstName} {candidate.lastName} · {candidate.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Profile status: {resumeReady ? "Resume ready" : "Draft"}
        </p>
      </div>

      <section className="space-y-1 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Basics
        </h3>
        <CareerProfileBasicsForm
          candidateId={candidate.id}
          initialBasics={profile.basics}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Work Experience
        </h3>
        <CareerProfileWorkForm
          candidateId={candidate.id}
          initialWork={profile.work}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Education
        </h3>
        <CareerProfileEducationForm
          candidateId={candidate.id}
          initialEducation={profile.education}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Skills
        </h3>
        <CareerProfileSkillsForm
          candidateId={candidate.id}
          initialSkills={profile.skills}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Projects
        </h3>
        <CareerProfileProjectsForm
          candidateId={candidate.id}
          initialProjects={profile.projects}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Certifications
        </h3>
        <CareerProfileCertificationsForm
          candidateId={candidate.id}
          initialCertifications={profile.certifications}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Languages
        </h3>
        <CareerProfileLanguagesForm
          candidateId={candidate.id}
          initialLanguages={profile.languages}
        />
      </section>
    </div>
  );
}
