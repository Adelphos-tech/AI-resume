-- AlterTable
ALTER TABLE "candidate" ADD COLUMN "userId" TEXT;

-- Add FK
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "candidate_userId_key" ON "candidate"("userId");
