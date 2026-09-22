-- CreateEnum
CREATE TYPE "ResumeExtractionStatus" AS ENUM ('SUCCEEDED', 'NO_TEXT', 'FAILED');

-- CreateTable
CREATE TABLE "candidate_resume_extraction" (
    "id" TEXT NOT NULL,
    "resumeSourceId" TEXT NOT NULL,
    "sourceSha256" TEXT NOT NULL,
    "status" "ResumeExtractionStatus" NOT NULL,
    "extractedText" TEXT,
    "pageCount" INTEGER,
    "characterCount" INTEGER,
    "parser" TEXT,
    "errorCode" TEXT,
    "extractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_resume_extraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_resume_extraction_resumeSourceId_key" ON "candidate_resume_extraction"("resumeSourceId");

-- AddForeignKey
ALTER TABLE "candidate_resume_extraction" ADD CONSTRAINT "candidate_resume_extraction_resumeSourceId_fkey" FOREIGN KEY ("resumeSourceId") REFERENCES "candidate_resume_source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
