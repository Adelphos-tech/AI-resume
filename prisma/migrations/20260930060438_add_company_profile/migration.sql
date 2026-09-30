-- CreateTable
CREATE TABLE "company_profile" (
    "id" TEXT NOT NULL,
    "publicProfileId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tagline" TEXT,
    "companyLogoKey" TEXT,
    "contactPersonName" TEXT,
    "contactPersonRole" TEXT,
    "publicPhone" TEXT,
    "publicEmail" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "xUrl" TEXT,
    "youtubeUrl" TEXT,
    "tiktokUrl" TEXT,
    "about" TEXT,
    "industry" TEXT,
    "locations" TEXT[],
    "services" TEXT[],
    "hiringOpen" BOOLEAN NOT NULL DEFAULT false,
    "openRolesSummary" TEXT,
    "openRolesUrl" TEXT,
    "companyProfileSummary" TEXT,
    "companyProfileUrl" TEXT,
    "showPublicPhone" BOOLEAN NOT NULL DEFAULT false,
    "showPublicEmail" BOOLEAN NOT NULL DEFAULT false,
    "showContactPerson" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_profile_publicProfileId_key" ON "company_profile"("publicProfileId");

-- AddForeignKey
ALTER TABLE "company_profile" ADD CONSTRAINT "company_profile_publicProfileId_fkey" FOREIGN KEY ("publicProfileId") REFERENCES "public_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
