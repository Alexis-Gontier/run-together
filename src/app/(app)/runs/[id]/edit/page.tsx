import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RunSource } from "@/generated/prisma/client"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import { RUN_SPORT_TYPES, type RunSportType } from "@/lib/runs/schemas"
import { type EditableRun, RunForm } from "../../_components/run-form"

export const metadata: Metadata = {
  title: "Modifier la course",
}

type EditRunPageProps = {
  params: Promise<{ id: string }>
}

const toSportType = (v: string | null): RunSportType =>
  RUN_SPORT_TYPES.find((t) => t === v) ?? "Run"

export default async function EditRunPage({ params }: EditRunPageProps) {
  const [{ id }, user] = await Promise.all([params, getRequiredUser()])

  const run = await prisma.run.findUnique({
    where: { id, userId: user.id },
    include: { splits: { orderBy: { kilometer: "asc" } } },
  })
  if (!run) notFound()

  const hasTrack = run.polyline || run.summaryPolyline || run.splits.length > 0
  const editable: EditableRun = {
    id: run.id,
    isStrava: run.source === RunSource.STRAVA,
    name: run.name ?? "",
    sportType: toSportType(run.sportType),
    date: run.date,
    distance: run.distance,
    duration: run.duration,
    elevation: run.elevation,
    heartRateAvg: run.heartRateAvg,
    heartRateMax: run.heartRateMax,
    cadenceAvg: run.cadenceAvg,
    calories: run.calories,
    // Le tracé existant est renvoyé tel quel à l'enregistrement, sinon il serait effacé.
    track: hasTrack
      ? {
          polyline: run.polyline,
          summaryPolyline: run.summaryPolyline,
          startLat: run.startLat,
          startLng: run.startLng,
          deviceName: run.deviceName,
          splits: run.splits.map((s) => ({
            kilometer: s.kilometer,
            distance: s.distance,
            duration: s.duration,
            heartRate: s.heartRate,
            elevation: s.elevation,
          })),
        }
      : null,
  }

  return (
    <div className="p-4">
      <RunForm run={editable} />
    </div>
  )
}
