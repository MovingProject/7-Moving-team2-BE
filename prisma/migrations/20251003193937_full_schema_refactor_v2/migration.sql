/*
  Warnings:

  - You are about to drop the column `isRead` on the `ChattingMessage` table. All the data in the column will be lost.
  - You are about to drop the column `consumerProfileId` on the `ChattingRoom` table. All the data in the column will be lost.
  - You are about to drop the column `driverProfileId` on the `ChattingRoom` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalArea` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalSize` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `consumerProfileId` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `departureArea` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `departureSize` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `driverProfileId` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `quotationStatement` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalSize` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `consumerProfileId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `departureSize` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `requestKind` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `requestStatement` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `targetDriverId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `consumerProfileId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `driverProfileId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId,driverId]` on the table `ChattingRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chattingMessageId]` on the table `Quotation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quotationId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `arrivalElevator` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalPyeong` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chattingMessageId` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureElevator` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departurePyeong` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moveAt` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalElevator` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalPyeong` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureElevator` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departurePyeong` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'CONCLUDED', 'COMPLETE', 'EXPIRED', 'CANCELED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."ActionState" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ActionSource" AS ENUM ('GENERAL', 'INVITED');

-- CreateEnum
CREATE TYPE "public"."QuotationStatus" AS ENUM ('SUBMITTED', 'REVISED', 'WITHDRAWN', 'SELECTED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'INVITE_RECEIVED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'INVITE_CANCELLED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REQUEST_CONCLUDED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REQUEST_COMPLETED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REQUEST_EXPIRED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'MOVE_DAY_REMINDER';

-- DropForeignKey
ALTER TABLE "public"."ChattingMessage" DROP CONSTRAINT "ChattingMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChattingRoom" DROP CONSTRAINT "ChattingRoom_consumerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChattingRoom" DROP CONSTRAINT "ChattingRoom_consumerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChattingRoom" DROP CONSTRAINT "ChattingRoom_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChattingRoom" DROP CONSTRAINT "ChattingRoom_driverProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChattingRoom" DROP CONSTRAINT "ChattingRoom_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_chattingRoomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_consumerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_consumerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_driverProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quotation" DROP CONSTRAINT "Quotation_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_consumerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_consumerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_targetDriverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_consumerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_consumerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_driverProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_quotationId_fkey";

-- AlterTable
ALTER TABLE "public"."ChattingMessage" DROP COLUMN "isRead",
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ChattingRoom" DROP COLUMN "consumerProfileId",
DROP COLUMN "driverProfileId",
ADD COLUMN     "closedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "isRead",
ADD COLUMN     "chattingRoomId" TEXT,
ADD COLUMN     "quotationId" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "reviewId" TEXT,
ADD COLUMN     "senderId" TEXT;

-- AlterTable
ALTER TABLE "public"."Quotation" DROP COLUMN "arrivalArea",
DROP COLUMN "arrivalSize",
DROP COLUMN "consumerProfileId",
DROP COLUMN "departureArea",
DROP COLUMN "departureSize",
DROP COLUMN "driverProfileId",
DROP COLUMN "quotationStatement",
DROP COLUMN "requirements",
ADD COLUMN     "additionalRequirements" TEXT,
ADD COLUMN     "arrivalElevator" BOOLEAN NOT NULL,
ADD COLUMN     "arrivalPyeong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "chattingMessageId" TEXT NOT NULL,
ADD COLUMN     "departureElevator" BOOLEAN NOT NULL,
ADD COLUMN     "departurePyeong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "moveAt" DATE NOT NULL,
ADD COLUMN     "previousQuotationId" TEXT,
ADD COLUMN     "selectedAt" TIMESTAMP(3),
ADD COLUMN     "serviceType" "public"."MoveType" NOT NULL,
ADD COLUMN     "status" "public"."QuotationStatus" NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "arrivalSize",
DROP COLUMN "consumerProfileId",
DROP COLUMN "departureSize",
DROP COLUMN "requestKind",
DROP COLUMN "requestStatement",
DROP COLUMN "requirements",
DROP COLUMN "targetDriverId",
ADD COLUMN     "additionalRequirements" TEXT,
ADD COLUMN     "arrivalElevator" BOOLEAN NOT NULL,
ADD COLUMN     "arrivalPyeong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "concludedAt" TIMESTAMP(3),
ADD COLUMN     "departureElevator" BOOLEAN NOT NULL,
ADD COLUMN     "departurePyeong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "requestStatus" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "withdrawnAt" TIMESTAMP(3),
ALTER COLUMN "moveAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "consumerProfileId",
DROP COLUMN "driverProfileId",
DROP COLUMN "rate",
ADD COLUMN     "rating" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "public"."QuotationStatement";

-- DropEnum
DROP TYPE "public"."RequestKind";

-- DropEnum
DROP TYPE "public"."RequestStatement";

-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverRequestAction" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "state" "public"."ActionState" NOT NULL,
    "source" "public"."ActionSource" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverRequestAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessageRead" (
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessageRead_pkey" PRIMARY KEY ("messageId","userId")
);

-- CreateIndex
CREATE INDEX "Invite_driverId_idx" ON "public"."Invite"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_requestId_driverId_key" ON "public"."Invite"("requestId", "driverId");

-- CreateIndex
CREATE INDEX "DriverRequestAction_driverId_state_idx" ON "public"."DriverRequestAction"("driverId", "state");

-- CreateIndex
CREATE INDEX "DriverRequestAction_requestId_state_idx" ON "public"."DriverRequestAction"("requestId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "DriverRequestAction_requestId_driverId_key" ON "public"."DriverRequestAction"("requestId", "driverId");

-- CreateIndex
CREATE INDEX "ChatMessageRead_userId_readAt_idx" ON "public"."ChatMessageRead"("userId", "readAt");

-- CreateIndex
CREATE INDEX "ChattingMessage_chattingRoomId_createdAt_idx" ON "public"."ChattingMessage"("chattingRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "ChattingRoom_consumerId_createdAt_idx" ON "public"."ChattingRoom"("consumerId", "createdAt");

-- CreateIndex
CREATE INDEX "ChattingRoom_driverId_createdAt_idx" ON "public"."ChattingRoom"("driverId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChattingRoom_requestId_driverId_key" ON "public"."ChattingRoom"("requestId", "driverId");

-- CreateIndex
CREATE INDEX "Notification_receiverId_readAt_idx" ON "public"."Notification"("receiverId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_receiverId_createdAt_idx" ON "public"."Notification"("receiverId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_chattingMessageId_key" ON "public"."Quotation"("chattingMessageId");

-- CreateIndex
CREATE INDEX "Quotation_driverId_createdAt_idx" ON "public"."Quotation"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "Quotation_consumerId_createdAt_idx" ON "public"."Quotation"("consumerId", "createdAt");

-- CreateIndex
CREATE INDEX "Quotation_requestId_createdAt_idx" ON "public"."Quotation"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "Quotation_chattingRoomId_createdAt_idx" ON "public"."Quotation"("chattingRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "Request_departureArea_idx" ON "public"."Request"("departureArea");

-- CreateIndex
CREATE INDEX "Request_arrivalArea_idx" ON "public"."Request"("arrivalArea");

-- CreateIndex
CREATE UNIQUE INDEX "Review_quotationId_key" ON "public"."Review"("quotationId");

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRequestAction" ADD CONSTRAINT "DriverRequestAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRequestAction" ADD CONSTRAINT "DriverRequestAction_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingMessage" ADD CONSTRAINT "ChattingMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageRead" ADD CONSTRAINT "ChatMessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."ChattingMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageRead" ADD CONSTRAINT "ChatMessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_chattingRoomId_fkey" FOREIGN KEY ("chattingRoomId") REFERENCES "public"."ChattingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_previousQuotationId_fkey" FOREIGN KEY ("previousQuotationId") REFERENCES "public"."Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_chattingMessageId_fkey" FOREIGN KEY ("chattingMessageId") REFERENCES "public"."ChattingMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_chattingRoomId_fkey" FOREIGN KEY ("chattingRoomId") REFERENCES "public"."ChattingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
