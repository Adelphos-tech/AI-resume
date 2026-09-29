import { PublicProfileSettings } from "@/components/candidate/public-profile/public-profile-settings";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { resolveCareerCardTheme } from "@/lib/career-card-themes";
import { resolveCareerCardAccent } from "@/lib/career-card-accent-colors";
import { getCandidatePublicProfile } from "@/server/public-profile/public-profile";

export const metadata = { title: "Career Card — RoleRace" };

export default async function CandidatePublicProfilePage() {
  const { candidate, profile } = await getCandidatePublicProfile();
  const link = profile?.links[0] ?? null;

  const variants = await prisma.resumeVariant.findMany({
    where: { candidateId: candidate.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      targetRole: true,
      targetCountry: true,
    },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Career Card
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Create a professional page you can share with recruiters, clients, and
          professional contacts.
        </p>
      </div>
      <PublicProfileSettings
        key={profile?.slug ?? "none"}
        slug={profile?.slug ?? null}
        isPublished={profile?.isPublished ?? false}
        shareUrl={link ? `${env.PUBLIC_SHARE_ORIGIN}/n/${link.token}` : null}
        publicUrl={profile ? `/u/${profile.slug}` : null}
        initial={
          profile
            ? {
                publicHeadline: profile.publicHeadline ?? "",
                publicBio: profile.publicBio ?? "",
                publicLocation: profile.publicLocation ?? "",
                currentFocus: profile.currentFocus ?? "",
                workAuthorization: profile.workAuthorization ?? "",
                openToOpportunities: profile.openToOpportunities,
                linkedinUrl: profile.linkedinUrl ?? "",
                githubUrl: profile.githubUrl ?? "",
                websiteUrl: profile.websiteUrl ?? "",
                showExperience: profile.showExperience,
                showEducation: profile.showEducation,
                showSkills: profile.showSkills,
                showProjects: profile.showProjects,
                showCertifications: profile.showCertifications,
                showLanguages: profile.showLanguages,
                featuredResumeVariantId: profile.featuredResumeVariantId ?? "",
                themeId: resolveCareerCardTheme(profile.themeId),
                accentColorId: resolveCareerCardAccent(profile.accentColorId),
              }
            : null
        }
        variants={variants}
        photoUrl={profile?.profilePhotoKey ? `/u/${profile.slug}/photo` : null}
        coverUrl={profile?.coverPhotoKey ? `/u/${profile.slug}/cover` : null}
        coverKey={profile?.coverPhotoKey ?? null}
        coverPosition={
          profile
            ? {
                focalX: profile.coverPhotoFocalX,
                focalY: profile.coverPhotoFocalY,
                zoom: profile.coverPhotoZoom,
              }
            : { focalX: 0.5, focalY: 0.5, zoom: 1 }
        }
        photoKey={profile?.profilePhotoKey ?? null}
        photoPosition={
          profile
            ? {
                focalX: profile.profilePhotoFocalX,
                focalY: profile.profilePhotoFocalY,
                zoom: profile.profilePhotoZoom,
              }
            : { focalX: 0.5, focalY: 0.5, zoom: 1 }
        }
        displayName={`${candidate.firstName} ${candidate.lastName}`.trim()}
      />
    </div>
  );
}
