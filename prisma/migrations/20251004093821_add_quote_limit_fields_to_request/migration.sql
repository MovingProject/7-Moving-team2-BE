-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "generalQuoteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generalQuoteLimit" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "invitedQuoteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitedQuoteLimit" INTEGER NOT NULL DEFAULT 3;
