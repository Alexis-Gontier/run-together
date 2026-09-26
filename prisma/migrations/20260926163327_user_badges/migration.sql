-- CreateTable
CREATE TABLE "user_badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeKey" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runId" TEXT,

    CONSTRAINT "user_badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_badge_userId_idx" ON "user_badge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badge_userId_badgeKey_key" ON "user_badge"("userId", "badgeKey");

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_runId_fkey" FOREIGN KEY ("runId") REFERENCES "run"("id") ON DELETE SET NULL ON UPDATE CASCADE;
