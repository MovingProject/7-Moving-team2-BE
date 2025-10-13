/*
  Warnings:

  - You are about to drop the `LIKE` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LIKE" DROP CONSTRAINT "LIKE_consumerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LIKE" DROP CONSTRAINT "LIKE_driverId_fkey";

-- DropTable
DROP TABLE "public"."LIKE";

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_consumerId_likedAt_id_idx" ON "public"."Like"("consumerId", "likedAt" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Like_consumerId_driverId_key" ON "public"."Like"("consumerId", "driverId");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
