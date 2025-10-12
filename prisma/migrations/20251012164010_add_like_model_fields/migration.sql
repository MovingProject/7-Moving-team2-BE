/*
  Warnings:

  - The primary key for the `LIKE` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[consumerId,driverId]` on the table `LIKE` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `LIKE` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."LIKE" DROP CONSTRAINT "LIKE_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "LIKE_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "LIKE_consumerId_likedAt_id_idx" ON "public"."LIKE"("consumerId", "likedAt" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LIKE_consumerId_driverId_key" ON "public"."LIKE"("consumerId", "driverId");
