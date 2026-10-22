import { ImageResponse } from "next/og"

import { formatMonth } from "@/lib/discord/embeds/monthly-ranking"
import { getMonthlyRankingData, monthRange } from "@/lib/discord/ranking"
import {
  OG,
  OG_MAX_RANKING,
  OG_PODIUM,
  OgRank,
  OgSummaryPanel,
} from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"

export const runtime = "nodejs"

const km = (meters: number) => (meters / 1000).toFixed(2).replace(".", ",")

/** Image du classement mensuel. `month` = `yyyy-MM`, mois lu à l'heure de Paris. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month } = await params
  if (
    !/^\d{4}-\d{2}$/.test(month) ||
    Number.isNaN(new Date(`${month}-01T00:00:00Z`).getTime())
  )
    return new Response("Bad request", { status: 400 })

  const { start, end } = monthRange(month)
  const data = await getMonthlyRankingData(start, end)
  if (!data)
    return ogUnavailable(
      "Classement du mois",
      "Plus aucune course sur ce mois.",
    )

  const shown = data.ranking.slice(0, OG_MAX_RANKING)
  const hidden = data.ranking.length - shown.length
  const max = shown[0]?.distance ?? 1
  // Lignes plus serrées quand le classement est long.
  const dense = shown.length > 5

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: OG.bg,
        fontFamily: "sans-serif",
      }}
    >
      <OgSummaryPanel
        eyebrow="CLASSEMENT DU MOIS"
        period={formatMonth(data.monthStart)}
        totalDistance={data.totalDistance}
        totalRuns={data.totalRuns}
        runners={data.ranking.length}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: dense ? "14px" : "24px",
          padding: "0 56px",
          backgroundColor: OG.panel,
        }}
      >
        {shown.map((r, i) => (
          <div
            key={r.name}
            style={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            <OgRank rank={i + 1} size={dense ? 36 : 44} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      color: OG.text,
                      fontSize: dense ? "22px" : "26px",
                      fontWeight: 700,
                    }}
                  >
                    {r.name}
                  </span>
                  <span style={{ color: OG.muted, fontSize: "16px" }}>
                    {r.runs} course{r.runs > 1 ? "s" : ""}
                  </span>
                </span>
                <span
                  style={{
                    color: i === 0 ? OG_PODIUM[0] : OG.text,
                    fontSize: dense ? "22px" : "26px",
                    fontWeight: 700,
                  }}
                >
                  {km(r.distance)} km
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  height: dense ? "6px" : "8px",
                  borderRadius: "9999px",
                  backgroundColor: OG.border,
                }}
              >
                <div
                  style={{
                    width: `${Math.max(2, (r.distance / max) * 100)}%`,
                    borderRadius: "9999px",
                    backgroundColor: OG_PODIUM[i] ?? OG.brand,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {hidden > 0 && (
          <span
            style={{ color: OG.muted, fontSize: "18px", paddingLeft: "56px" }}
          >
            + {hidden} autre{hidden > 1 ? "s" : ""} coureur
            {hidden > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
