-- CreateTable
CREATE TABLE "resume_variant" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "targetCountry" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "profileSchemaVersion" INTEGER NOT NULL,
    "profileSnapshot" JSONB NOT NULL,
    "resumeData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_variant_candidateId_idx" ON "resume_variant"("candidateId");

-- AddForeignKey
ALTER TABLE "resume_variant" ADD CONSTRAINT "resume_variant_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
