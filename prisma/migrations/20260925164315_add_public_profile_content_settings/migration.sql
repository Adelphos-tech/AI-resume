-- AlterTable
ALTER TABLE "public_profile" ADD COLUMN     "featuredResumeVariantId" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "publicBio" TEXT,
ADD COLUMN     "workAuthorization" TEXT,
ADD COLUMN     "currentFocus" TEXT,
ADD COLUMN     "openToOpportunities" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicHeadline" TEXT,
ADD COLUMN     "publicLocation" TEXT,
ADD COLUMN     "showCertifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showEducation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showExperience" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showLanguages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showProjects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showSkills" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "websiteUrl" TEXT;

-- AddForeignKey
ALTER TABLE "public_profile" ADD CONSTRAINT "public_profile_featuredResumeVariantId_fkey" FOREIGN KEY ("featuredResumeVariantId") REFERENCES "resume_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
