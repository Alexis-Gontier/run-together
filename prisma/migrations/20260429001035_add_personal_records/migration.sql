-- CreateEnum
CREATE TYPE "PRDistance" AS ENUM ('KM_1', 'KM_5', 'KM_10', 'HALF_MARATHON', 'MARATHON');

-- CreateTable
CREATE TABLE "personal_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runId" TEXT,
    "distance" "PRDistance" NOT NULL,
    "duration" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL,

    CONSTRAINT "personal_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_record_userId_idx" ON "personal_record"("userId");

-- CreateIndex
CREATE INDEX "personal_record_runId_idx" ON "personal_record"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_record_userId_distance_key" ON "personal_record"("userId", "distance");

-- AddForeignKey
ALTER TABLE "personal_record" ADD CONSTRAINT "personal_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_record" ADD CONSTRAINT "personal_record_runId_fkey" FOREIGN KEY ("runId") REFERENCES "run"("id") ON DELETE SET NULL ON UPDATE CASCADE;
