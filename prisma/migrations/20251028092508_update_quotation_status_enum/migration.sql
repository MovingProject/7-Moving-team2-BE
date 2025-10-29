/*
  Warnings:

  - The values [SUBMITTED,REVISED,WITHDRAWN,SELECTED] on the enum `QuotationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuotationStatus_new" AS ENUM ('PENDING', 'CONCLUDED', 'COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" TYPE "public"."QuotationStatus_new" USING ("status"::text::"public"."QuotationStatus_new");
ALTER TYPE "public"."QuotationStatus" RENAME TO "QuotationStatus_old";
ALTER TYPE "public"."QuotationStatus_new" RENAME TO "QuotationStatus";
DROP TYPE "public"."QuotationStatus_old";
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
