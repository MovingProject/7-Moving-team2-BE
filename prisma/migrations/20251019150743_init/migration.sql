-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('DRIVER', 'CONSUMER');

-- CreateEnum
CREATE TYPE "public"."MoveType" AS ENUM ('SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE');

-- CreateEnum
CREATE TYPE "public"."Area" AS ENUM ('SEOUL', 'GYEONGGI', 'INCHEON', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'SEJONG', 'DAEJEON', 'JEONBUK', 'JEONNAM', 'GWANGJU', 'GYEONGBUK', 'GYEONGNAM', 'DAEGU', 'ULSAN', 'BUSAN', 'JEJU');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'CONCLUDED', 'COMPLETE', 'EXPIRED', 'CANCELED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."ActionState" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ActionSource" AS ENUM ('GENERAL', 'INVITED');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('MESSAGE', 'QUOTATION');

-- CreateEnum
CREATE TYPE "public"."QuotationStatus" AS ENUM ('SUBMITTED', 'REVISED', 'WITHDRAWN', 'SELECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_QUOTATION', 'QUOTATION_ACCEPTED', 'NEW_MESSAGE', 'REVIEW_RECEIVED', 'INVITE_RECEIVED', 'INVITE_CANCELLED', 'REQUEST_CONCLUDED', 'REQUEST_COMPLETED', 'REQUEST_EXPIRED', 'MOVE_DAY_REMINDER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "providerId" TEXT,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "image" TEXT,
    "nickname" TEXT NOT NULL,
    "careerYears" INTEGER NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "confirmedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverServiceArea" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "serviceArea" "public"."Area" NOT NULL,

    CONSTRAINT "DriverServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverServiceType" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "serviceType" "public"."MoveType" NOT NULL,

    CONSTRAINT "DriverServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsumerProfile" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "image" TEXT,
    "serviceType" "public"."MoveType" NOT NULL,
    "areas" "public"."Area" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ConsumerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Request" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "serviceType" "public"."MoveType" NOT NULL,
    "moveAt" DATE NOT NULL,
    "departureAddress" TEXT NOT NULL,
    "departureFloor" INTEGER NOT NULL,
    "departurePyeong" DOUBLE PRECISION NOT NULL,
    "departureElevator" BOOLEAN NOT NULL,
    "arrivalAddress" TEXT NOT NULL,
    "arrivalFloor" INTEGER NOT NULL,
    "arrivalPyeong" DOUBLE PRECISION NOT NULL,
    "arrivalElevator" BOOLEAN NOT NULL,
    "additionalRequirements" TEXT,
    "departureArea" "public"."Area" NOT NULL,
    "arrivalArea" "public"."Area" NOT NULL,
    "requestStatus" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "generalQuoteCount" INTEGER NOT NULL DEFAULT 0,
    "invitedQuoteCount" INTEGER NOT NULL DEFAULT 0,
    "generalQuoteLimit" INTEGER NOT NULL DEFAULT 5,
    "invitedQuoteLimit" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "concludedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."ChattingRoom" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "ChattingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChattingMessage" (
    "id" TEXT NOT NULL,
    "chattingRoomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChattingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessageRead" (
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessageRead_pkey" PRIMARY KEY ("messageId","userId")
);

-- CreateTable
CREATE TABLE "public"."Quotation" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "chattingRoomId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "serviceType" "public"."MoveType" NOT NULL,
    "moveAt" DATE NOT NULL,
    "departureAddress" TEXT NOT NULL,
    "departureFloor" INTEGER NOT NULL,
    "departurePyeong" DOUBLE PRECISION NOT NULL,
    "departureElevator" BOOLEAN NOT NULL,
    "arrivalAddress" TEXT NOT NULL,
    "arrivalFloor" INTEGER NOT NULL,
    "arrivalPyeong" DOUBLE PRECISION NOT NULL,
    "arrivalElevator" BOOLEAN NOT NULL,
    "additionalRequirements" TEXT,
    "price" INTEGER NOT NULL,
    "status" "public"."QuotationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "previousQuotationId" TEXT,
    "selectedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "chattingMessageId" TEXT NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "quotationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "notificationType" "public"."NotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "requestId" TEXT,
    "quotationId" TEXT,
    "chattingRoomId" TEXT,
    "reviewId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "public"."User"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "public"."RefreshToken"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "public"."RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "public"."DriverProfile"("userId");

-- CreateIndex
CREATE INDEX "Like_consumerId_likedAt_id_idx" ON "public"."Like"("consumerId", "likedAt" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Like_consumerId_driverId_key" ON "public"."Like"("consumerId", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_likedAt_id_key" ON "public"."Like"("likedAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerProfile_consumerId_key" ON "public"."ConsumerProfile"("consumerId");

-- CreateIndex
CREATE INDEX "Request_pending_lookup" ON "public"."Request"("consumerId", "requestStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_departureArea_idx" ON "public"."Request"("departureArea");

-- CreateIndex
CREATE INDEX "Request_arrivalArea_idx" ON "public"."Request"("arrivalArea");

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
CREATE INDEX "ChattingRoom_consumerId_createdAt_idx" ON "public"."ChattingRoom"("consumerId", "createdAt");

-- CreateIndex
CREATE INDEX "ChattingRoom_driverId_createdAt_idx" ON "public"."ChattingRoom"("driverId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChattingRoom_requestId_driverId_key" ON "public"."ChattingRoom"("requestId", "driverId");

-- CreateIndex
CREATE INDEX "ChattingMessage_chattingRoomId_createdAt_idx" ON "public"."ChattingMessage"("chattingRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessageRead_userId_readAt_idx" ON "public"."ChatMessageRead"("userId", "readAt");

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
CREATE UNIQUE INDEX "Review_quotationId_key" ON "public"."Review"("quotationId");

-- CreateIndex
CREATE INDEX "Notification_receiverId_readAt_idx" ON "public"."Notification"("receiverId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_receiverId_createdAt_idx" ON "public"."Notification"("receiverId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverServiceArea" ADD CONSTRAINT "DriverServiceArea_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverServiceType" ADD CONSTRAINT "DriverServiceType_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumerProfile" ADD CONSTRAINT "ConsumerProfile_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."ChattingMessage" ADD CONSTRAINT "ChattingMessage_chattingRoomId_fkey" FOREIGN KEY ("chattingRoomId") REFERENCES "public"."ChattingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
