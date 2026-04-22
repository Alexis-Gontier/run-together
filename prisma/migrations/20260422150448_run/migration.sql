-- CreateEnum
CREATE TYPE "RunSource" AS ENUM ('STRAVA', 'MANUAL');

-- CreateTable
CREATE TABLE "run" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "RunSource" NOT NULL DEFAULT 'STRAVA',
    "stravaId" TEXT,
    "name" TEXT,
    "distance" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL,
    "elevation" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "heartRateAvg" INTEGER,
    "heartRateMax" INTEGER,
    "cadenceAvg" INTEGER,
    "calories" INTEGER,
    "summaryPolyline" TEXT,
    "polyline" TEXT,
    "startLat" DOUBLE PRECISION,
    "startLng" DOUBLE PRECISION,
    "sportType" TEXT,
    "deviceName" TEXT,

    CONSTRAINT "run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_stravaId_key" ON "run"("stravaId");

-- CreateIndex
CREATE INDEX "run_userId_date_idx" ON "run"("userId", "date");

-- AddForeignKey
ALTER TABLE "run" ADD CONSTRAINT "run_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
