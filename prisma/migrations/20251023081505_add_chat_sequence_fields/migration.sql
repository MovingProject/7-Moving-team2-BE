/*
  Warnings:

  - A unique constraint covering the columns `[chattingRoomId,sequence]` on the table `ChattingMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence` to the `ChattingMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ChattingMessage" ADD COLUMN     "sequence" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ChattingRoom" ADD COLUMN     "nextSequence" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ChattingMessage_chattingRoomId_sequence_idx" ON "public"."ChattingMessage"("chattingRoomId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "ChattingMessage_chattingRoomId_sequence_key" ON "public"."ChattingMessage"("chattingRoomId", "sequence");
