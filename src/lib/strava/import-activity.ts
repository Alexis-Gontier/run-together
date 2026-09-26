import { RunSource } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { recordRun } from "@/lib/runs/record-run"
import { stravaApiFetch } from "@/lib/strava/client"
import { STRAVA_RUN_TYPES, stravaEndpoints } from "@/lib/strava/constants"
import { stravaActivityDetailSchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"
import { stravaActivityToRunInput } from "./create-run-from-activity"

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

  await recordRun(stravaActivityToRunInput(activity), {
    userId,
    userName: account.user.name ?? "Inconnu",
    source: RunSource.STRAVA,
    stravaId: String(activityId),
    notify: !options.silent,
    replaceExisting: options.replaceExisting,
  })
}
