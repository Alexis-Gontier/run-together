-- CreateTable
CREATE TABLE "split" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kilometer" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL,
    "heartRate" INTEGER,
    "elevation" DOUBLE PRECISION,

    CONSTRAINT "split_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "split_runId_idx" ON "split"("runId");

-- AddForeignKey
ALTER TABLE "split" ADD CONSTRAINT "split_runId_fkey" FOREIGN KEY ("runId") REFERENCES "run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
