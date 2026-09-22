-- CreateTable
CREATE TABLE "candidate_resume_source" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_resume_source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_resume_source_candidateId_key" ON "candidate_resume_source"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_resume_source_storageKey_key" ON "candidate_resume_source"("storageKey");

-- AddForeignKey
ALTER TABLE "candidate_resume_source" ADD CONSTRAINT "candidate_resume_source_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
