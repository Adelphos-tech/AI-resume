-- CreateTable
CREATE TABLE "candidate_intake_access" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_intake_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_intake_access_candidateId_key" ON "candidate_intake_access"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_intake_access_tokenHash_key" ON "candidate_intake_access"("tokenHash");

-- AddForeignKey
ALTER TABLE "candidate_intake_access" ADD CONSTRAINT "candidate_intake_access_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
