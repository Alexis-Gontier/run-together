import { format } from "date-fns"
import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { buildWeeklyRecapMessage } from "@/lib/discord/embeds/weekly-recap"
import { notify } from "@/lib/discord/notify"
import { getWeeklyRecapData, previousWeek } from "@/lib/discord/recap"

/**
 * Cron Vercel du lundi matin (voir vercel.json). Vercel envoie
 * `Authorization: Bearer $CRON_SECRET`. `?dry=1` renvoie le message sans l'envoyer.
 */
export async function GET(request: NextRequest) {
  if (!env.CRON_SECRET)
    return NextResponse.json({ error: "CRON_SECRET absent" }, { status: 503 })
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = request.nextUrl.searchParams
  const dry = params.get("dry") === "1"
  // En mode à blanc seulement, `?at=2026-08-18` simule une exécution à cette date.
  const at =
    dry && params.get("at") ? new Date(params.get("at") ?? "") : new Date()
  if (Number.isNaN(at.getTime()))
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })

  const { start, end } = previousWeek(at)
  const data = await getWeeklyRecapData(start, end)
  if (!data) return NextResponse.json({ status: "empty", start, end })

  const message = buildWeeklyRecapMessage(data)
  if (dry) return NextResponse.json({ status: "dry", message })

  const status = await notify({
    type: "recap.weekly",
    dedupeKey: `recap.weekly:${format(start, "yyyy-MM-dd")}`,
    message,
  })
  return NextResponse.json({ status })
}
