-- CreateEnum
CREATE TYPE "WorkplacePreference" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "EmploymentPreference" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateTable
CREATE TABLE "candidate_intake" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "currentRole" TEXT,
    "targetRoles" TEXT[],
    "preferredLocations" TEXT[],
    "workplacePreferences" "WorkplacePreference"[],
    "employmentPreferences" "EmploymentPreference"[],
    "salaryExpectation" INTEGER,
    "salaryCurrency" TEXT,
    "workAuthorization" TEXT,
    "requiresSponsorship" BOOLEAN,
    "preferredIndustries" TEXT[],
    "careerGoals" TEXT,
    "additionalNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_intake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_intake_candidateId_key" ON "candidate_intake"("candidateId");

-- AddForeignKey
ALTER TABLE "candidate_intake" ADD CONSTRAINT "candidate_intake_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
