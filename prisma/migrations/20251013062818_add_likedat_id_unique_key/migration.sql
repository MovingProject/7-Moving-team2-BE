/*
  Warnings:

  - A unique constraint covering the columns `[likedAt,id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_likedAt_id_key" ON "public"."Like"("likedAt", "id");
