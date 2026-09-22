-- CreateEnum
CREATE TYPE "CandidatePackage" AS ENUM ('STARTER_LAP', 'CAREER_GRID', 'POLE_POSITION');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('NEW', 'INTAKE_PENDING', 'IN_REVIEW', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'DELIVERED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "candidate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "package" "CandidatePackage" NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "candidate_status_idx" ON "candidate"("status");

-- CreateIndex
CREATE INDEX "candidate_createdAt_idx" ON "candidate"("createdAt");
