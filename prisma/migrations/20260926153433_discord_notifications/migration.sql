-- CreateEnum
CREATE TYPE "DiscordNotificationStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "discord_notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" "DiscordNotificationStatus" NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "discord_notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_notification_dedupeKey_key" ON "discord_notification"("dedupeKey");

-- CreateIndex
CREATE INDEX "discord_notification_createdAt_idx" ON "discord_notification"("createdAt");
