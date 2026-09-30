-- AlterTable
ALTER TABLE "public_profile" ADD COLUMN     "showWhatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappCountry" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;
