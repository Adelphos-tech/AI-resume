-- CreateTable
CREATE TABLE "master_career_profile" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "profileData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_career_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_career_profile_candidateId_key" ON "master_career_profile"("candidateId");

-- AddForeignKey
ALTER TABLE "master_career_profile" ADD CONSTRAINT "master_career_profile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
