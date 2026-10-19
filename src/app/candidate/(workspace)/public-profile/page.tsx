import { CareerCardBuilderPageClient } from "@/components/candidate/public-profile/career-card-builder-client";
import { type CompanyProfileState } from "@/components/candidate/public-profile/company-profile-settings";
import { prisma } from "@/server/db";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { resolveNfcCompactSkin } from "@/lib/nfc-compact-skins";

import { env } from "@/server/env";
import { resolveCareerCardTheme } from "@/lib/career-card-themes";
import { resolveCareerCardAccent } from "@/lib/career-card-accent-colors";
import { resolveCareerCardStyle } from "@/lib/career-card-styles";
import { getCandidatePublicProfile } from "@/server/public-profile/public-profile";

export const metadata = { title: "Career Card — LinkMeU" };

export default async function CandidatePublicProfilePage() {
  const { candidate, profile } = await getCandidatePublicProfile();
  const link = profile?.links[0] ?? null;
  const company = await prisma.companyProfile.findUnique({
    where: { publicProfileId: profile?.id ?? "" },
  });
  const companyInitial: CompanyProfileState | null = company
    ? {
        companyName: company.companyName,
        tagline: company.tagline ?? "",
        contactPersonName: company.contactPersonName ?? "",
        contactPersonRole: company.contactPersonRole ?? "",
        publicPhone: company.publicPhone ?? "",
        whatsappNumber: company.whatsappNumber
          ? (parsePhoneNumberFromString(
              company.whatsappNumber,
            )?.formatNational() ?? company.whatsappNumber)
          : "",
        whatsappCountry:
          company.whatsappCountry ??
          (company.whatsappNumber
            ? (parsePhoneNumberFromString(company.whatsappNumber)?.country ??
              "")
            : ""),
        publicEmail: company.publicEmail ?? "",
        websiteUrl: company.websiteUrl ?? "",
        linkedinUrl: company.linkedinUrl ?? "",
        facebookUrl: company.facebookUrl ?? "",
        instagramUrl: company.instagramUrl ?? "",
        xUrl: company.xUrl ?? "",
        youtubeUrl: company.youtubeUrl ?? "",
        tiktokUrl: company.tiktokUrl ?? "",
        about: company.about ?? "",
        industry: company.industry ?? "",
        locations: company.locations,
        services: company.services,
        hiringOpen: company.hiringOpen,
        openRolesSummary: company.openRolesSummary ?? "",
        openRolesUrl: company.openRolesUrl ?? "",
        companyProfileSummary: company.companyProfileSummary ?? "",
        companyProfileUrl: company.companyProfileUrl ?? "",
        showPublicPhone: company.showPublicPhone,
        showWhatsapp: company.showWhatsapp,
        showPublicEmail: company.showPublicEmail,
        showContactPerson: company.showContactPerson,
        isVisible: company.isVisible,
      }
    : null;

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

  const initialState = profile
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
        whatsappNumber: profile.whatsappNumber
          ? (parsePhoneNumberFromString(
              profile.whatsappNumber,
            )?.formatNational() ?? profile.whatsappNumber)
          : "",
        whatsappCountry:
          profile.whatsappCountry ??
          (profile.whatsappNumber
            ? (parsePhoneNumberFromString(profile.whatsappNumber)?.country ??
              "")
            : ""),
        showWhatsapp: profile.showWhatsapp,
        showExperience: profile.showExperience,
        showEducation: profile.showEducation,
        showSkills: profile.showSkills,
        showProjects: profile.showProjects,
        showCertifications: profile.showCertifications,
        showLanguages: profile.showLanguages,
        featuredResumeVariantId: profile.featuredResumeVariantId ?? "",
        themeId: resolveCareerCardTheme(profile.themeId),
        accentColorId: resolveCareerCardAccent(profile.accentColorId),
        cardStyleId: resolveCareerCardStyle(profile.cardStyleId),
        nfcCompactSkinId: resolveNfcCompactSkin(profile.nfcCompactSkinId),
      }
    : null;

  return (
    <CareerCardBuilderPageClient
      key={profile?.slug ?? "none"}
      initialState={initialState}
      slug={profile?.slug ?? null}
      isPublished={profile?.isPublished ?? false}
      shareUrl={link ? `${env.PUBLIC_SHARE_ORIGIN}/n/${link.token}` : null}
      publicUrl={profile ? `/u/${profile.slug}` : null}
      variants={variants}
      photoUrl={profile?.profilePhotoKey ? `/u/${profile.slug}/photo` : null}
      displayName={`${candidate.firstName} ${candidate.lastName}`.trim()}
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
      companyInitial={companyInitial}
      logoUrl={
        profile && company?.companyLogoKey
          ? `/u/${profile.slug}/company-logo`
          : null
      }
    />
  );
}
