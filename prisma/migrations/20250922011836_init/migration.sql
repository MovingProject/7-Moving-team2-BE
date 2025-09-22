-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('DRIVER', 'CONSUMER');

-- CreateEnum
CREATE TYPE "public"."MoveType" AS ENUM ('SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE');

-- CreateEnum
CREATE TYPE "public"."Area" AS ENUM ('SEOUL', 'GYEONGGI', 'INCHEON', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'SEJONG', 'DAEJEON', 'JEONBUK', 'JEONNAM', 'GWANGJU', 'GYEONGBUK', 'GYEONGNAM', 'DAEGU', 'ULSAN', 'BUSAN', 'JEJU');

-- CreateEnum
CREATE TYPE "public"."RequestStatement" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('QUOTATION', 'MESSAGE');

-- CreateEnum
CREATE TYPE "public"."QuotationStatement" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_QUOTATION', 'QUOTATION_ACCEPTED', 'NEW_MESSAGE', 'REVIEW_RECEIVED');

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
CREATE TABLE "public"."DriverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "image" TEXT,
    "nickname" TEXT NOT NULL,
    "careerYears" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "description" TEXT NOT NULL,
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
CREATE TABLE "public"."LIKE" (
    "consumerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "LIKE_pkey" PRIMARY KEY ("consumerId","driverId")
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
    "consumerProfileId" TEXT NOT NULL,
    "serviceType" "public"."MoveType" NOT NULL,
    "moveAt" TIMESTAMP(3) NOT NULL,
    "departureAddress" TEXT NOT NULL,
    "departureFloor" INTEGER NOT NULL,
    "departureSize" DOUBLE PRECISION NOT NULL,
    "arrivalAddress" TEXT NOT NULL,
    "arrivalFloor" INTEGER NOT NULL,
    "arrivalSize" DOUBLE PRECISION NOT NULL,
    "requirements" TEXT,
    "departureArea" "public"."Area" NOT NULL,
    "arrivalArea" "public"."Area" NOT NULL,
    "requestStatement" "public"."RequestStatement" NOT NULL,
    "targetDriverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChattingRoom" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "consumerProfileId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChattingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChattingMessage" (
    "id" TEXT NOT NULL,
    "chattingRoomId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChattingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quotation" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "consumerProfileId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "chattingRoomId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "departureAddress" TEXT NOT NULL,
    "departureFloor" INTEGER NOT NULL,
    "departureSize" DOUBLE PRECISION NOT NULL,
    "arrivalAddress" TEXT NOT NULL,
    "arrivalFloor" INTEGER NOT NULL,
    "arrivalSize" DOUBLE PRECISION NOT NULL,
    "requirements" TEXT,
    "departureArea" "public"."Area" NOT NULL,
    "arrivalArea" "public"."Area" NOT NULL,
    "price" INTEGER NOT NULL,
    "quotationStatement" "public"."QuotationStatement" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "consumerProfileId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
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
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "notificationType" "public"."NotificationType" NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "public"."User"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "public"."DriverProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerProfile_consumerId_key" ON "public"."ConsumerProfile"("consumerId");

-- AddForeignKey
ALTER TABLE "public"."DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverServiceArea" ADD CONSTRAINT "DriverServiceArea_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverServiceType" ADD CONSTRAINT "DriverServiceType_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LIKE" ADD CONSTRAINT "LIKE_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LIKE" ADD CONSTRAINT "LIKE_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumerProfile" ADD CONSTRAINT "ConsumerProfile_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_consumerProfileId_fkey" FOREIGN KEY ("consumerProfileId") REFERENCES "public"."ConsumerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_targetDriverId_fkey" FOREIGN KEY ("targetDriverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_consumerProfileId_fkey" FOREIGN KEY ("consumerProfileId") REFERENCES "public"."ConsumerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingRoom" ADD CONSTRAINT "ChattingRoom_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingMessage" ADD CONSTRAINT "ChattingMessage_chattingRoomId_fkey" FOREIGN KEY ("chattingRoomId") REFERENCES "public"."ChattingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChattingMessage" ADD CONSTRAINT "ChattingMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_consumerProfileId_fkey" FOREIGN KEY ("consumerProfileId") REFERENCES "public"."ConsumerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_chattingRoomId_fkey" FOREIGN KEY ("chattingRoomId") REFERENCES "public"."ChattingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_consumerProfileId_fkey" FOREIGN KEY ("consumerProfileId") REFERENCES "public"."ConsumerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "public"."DriverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
