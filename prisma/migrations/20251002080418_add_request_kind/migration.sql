/*
  Warnings:

  - Added the required column `requestKind` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RequestKind" AS ENUM ('GENERAL', 'DIRECT');

-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "requestKind" "public"."RequestKind" NOT NULL;
