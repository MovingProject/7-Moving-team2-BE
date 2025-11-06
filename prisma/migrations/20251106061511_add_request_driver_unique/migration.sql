/*
  Warnings:

  - A unique constraint covering the columns `[requestId,driverId]` on the table `Quotation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Quotation_requestId_driverId_key" ON "public"."Quotation"("requestId", "driverId");
