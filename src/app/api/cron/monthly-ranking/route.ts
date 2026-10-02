import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { buildMonthlyRankingMessage } from "@/lib/discord/embeds/monthly-ranking"
import { notify } from "@/lib/discord/notify"
import { getMonthlyRankingData, previousMonth } from "@/lib/discord/ranking"

/**
 * Cron Vercel du 1er du mois (voir vercel.json). Vercel envoie
 * `Authorization: Bearer $CRON_SECRET`. `?dry=1` renvoie le message sans l'envoyer.
 */
export async function GET(request: NextRequest) {
  if (!env.CRON_SECRET)
    return NextResponse.json({ error: "CRON_SECRET absent" }, { status: 503 })
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = request.nextUrl.searchParams
  const dry = params.get("dry") === "1"
  // En mode à blanc seulement, `?at=2026-10-01` simule une exécution à cette date.
  const at =
    dry && params.get("at") ? new Date(params.get("at") ?? "") : new Date()
  if (Number.isNaN(at.getTime()))
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })

  const { start, end } = previousMonth(at)
  const data = await getMonthlyRankingData(start, end)
  if (!data) return NextResponse.json({ status: "empty", start, end })

  const message = buildMonthlyRankingMessage(data)
  if (dry) return NextResponse.json({ status: "dry", message })

  const status = await notify({
    type: "ranking.monthly",
    dedupeKey: `ranking.monthly:${start.toISOString().slice(0, 7)}`,
    message,
  })
  return NextResponse.json({ status })
}
