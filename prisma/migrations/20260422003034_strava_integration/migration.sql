-- CreateTable
CREATE TABLE "strava_account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "stravaAthleteId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'activity:read_all',

    CONSTRAINT "strava_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strava_account_userId_key" ON "strava_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "strava_account_stravaAthleteId_key" ON "strava_account"("stravaAthleteId");

-- AddForeignKey
ALTER TABLE "strava_account" ADD CONSTRAINT "strava_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
