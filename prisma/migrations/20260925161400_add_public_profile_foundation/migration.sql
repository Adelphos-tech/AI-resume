-- CreateTable
CREATE TABLE "public_profile" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_profile_link" (
    "id" TEXT NOT NULL,
    "publicProfileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_profile_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_profile_candidateId_key" ON "public_profile"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "public_profile_slug_key" ON "public_profile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "public_profile_link_publicProfileId_key" ON "public_profile_link"("publicProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "public_profile_link_token_key" ON "public_profile_link"("token");

-- AddForeignKey
ALTER TABLE "public_profile" ADD CONSTRAINT "public_profile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_profile_link" ADD CONSTRAINT "public_profile_link_publicProfileId_fkey" FOREIGN KEY ("publicProfileId") REFERENCES "public_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
