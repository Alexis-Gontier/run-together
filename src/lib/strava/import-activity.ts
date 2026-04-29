import { sendRunNotification } from "@/lib/discord"
import { prisma } from "@/lib/db/prisma"
import { stravaApiFetch } from "@/lib/strava/client"
import { STRAVA_RUN_TYPES, stravaEndpoints } from "@/lib/strava/constants"
import { stravaActivityDetailSchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"
import { createRunFromActivity } from "./create-run-from-activity"
import { updatePersonalRecords } from "./personal-records"

interface ImportOptions {
  // When true, non-run activities are silently skipped instead of throwing
  silent?: boolean
  // When true, deletes and recreates the run atomically (for webhook update events)
  replaceExisting?: boolean
}

export async function importStravaActivity(
  userId: string,
  activityId: number,
  options: ImportOptions = {},
): Promise<void> {
  const account = await prisma.stravaAccount.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  })
  if (!account) throw new Error("Strava account not found")

  const accessToken = await getValidAccessToken(account)

  const activity = await stravaApiFetch(
    stravaEndpoints.activityDetail(activityId),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      schema: stravaActivityDetailSchema,
    },
  )

  if (!(STRAVA_RUN_TYPES as readonly string[]).includes(activity.sport_type)) {
    if (!options.silent)
      throw new Error(
        `Activity ${activityId} is not a run (${activity.sport_type})`,
      )
    return
  }

  if (!options.replaceExisting) {
    const existing = await prisma.run.findUnique({
      where: { stravaId: String(activityId) },
      select: { id: true },
    })
    if (existing) return
  }

  const run = await prisma.$transaction(async (tx) => {
    if (options.replaceExisting) {
      await tx.run.deleteMany({
        where: { stravaId: String(activityId), userId },
      })
    }
    return createRunFromActivity(tx, userId, activity)
  })

  const splits = (activity.splits_metric ?? []).map((s) => ({
    kilometer: s.split,
    distance: s.distance,
    duration: s.moving_time,
    pace: s.distance > 0 ? Math.round((s.moving_time / s.distance) * 1000) : 0,
  }))

  try {
    await updatePersonalRecords(userId, run, splits)
  } catch (err) {
    console.error("[personal-records] update failed", run.id, err)
  }

  if (!options.silent) {
    const userName = account.user.name ?? "Inconnu"
    const runName = run.name || "Course sans nom"

    try {
      await sendRunNotification({ runId: run.id, userName, runName })
    } catch (err) {
      console.error("[discord] run notification failed", err)
    }
  }
}
