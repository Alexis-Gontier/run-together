import { ImageResponse } from "next/og"

import { formatWeekRange } from "@/lib/discord/embeds/weekly-recap"
import { getWeeklyRecapData, weekFromMonday } from "@/lib/discord/recap"
import {
  OG,
  OG_MAX_RECAP_RECORDS,
  OG_PODIUM,
  OgRank,
  OgSummaryPanel,
} from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"

export const runtime = "nodejs"

const km = (meters: number) => (meters / 1000).toFixed(2).replace(".", ",")

function Label({ children }: { children: string }) {
  return (
    <span
      style={{
        color: OG.muted,
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "3px",
      }}
    >
      {children}
    </span>
  )
}

/** Image du récap hebdo. `week` = lundi de la semaine (jour de Paris), `yyyy-MM-dd`. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ week: string }> },
) {
  const { week } = await params
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(week) ||
    Number.isNaN(new Date(`${week}T00:00:00Z`).getTime())
  )
    return new Response("Bad request", { status: 400 })

  const { start, end } = weekFromMonday(week)
  const data = await getWeeklyRecapData(start, end)
  if (!data)
    return ogUnavailable(
      "Récap de la semaine",
      "Plus aucune course sur cette semaine.",
    )

  const max = data.topDistance[0]?.distance ?? 1
  const records = data.records.slice(0, OG_MAX_RECAP_RECORDS)
  const hiddenRecords = data.records.length - records.length

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
        eyebrow="RÉCAP DE LA SEMAINE"
        period={formatWeekRange(data.weekStart, data.weekEnd)}
        totalDistance={data.totalDistance}
        totalRuns={data.totalRuns}
        runners={data.runners}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: "30px",
          padding: "0 52px",
          backgroundColor: OG.panel,
        }}
      >
        {/* ── Podium distance ──────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Label>PODIUM DISTANCE</Label>
          {data.topDistance.map((r, i) => (
            <div
              key={r.name}
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <OgRank rank={i + 1} size={34} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "22px",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: OG.text }}>{r.name}</span>
                  <span style={{ color: i === 0 ? OG_PODIUM[0] : OG.text }}>
                    {km(r.distance)} km
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: OG.border,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(2, (r.distance / max) * 100)}%`,
                      borderRadius: "9999px",
                      backgroundColor: OG_PODIUM[i],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Régularité + meilleure allure ────────────────── */}
        <div style={{ display: "flex", gap: "40px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "10px",
            }}
          >
            <Label>RÉGULARITÉ</Label>
            {data.topRuns.map((r, i) => (
              <div
                key={r.name}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <OgRank rank={i + 1} size={26} />
                <span
                  style={{ color: OG.text, fontSize: "19px", fontWeight: 600 }}
                >
                  {r.name}
                </span>
                <span style={{ color: OG.muted, fontSize: "17px" }}>
                  {r.runs} course{r.runs > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
          {data.bestPace && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingLeft: "40px",
                borderLeft: `1px solid ${OG.border}`,
              }}
            >
              <Label>MEILLEURE ALLURE</Label>
              <span
                style={{ display: "flex", alignItems: "baseline", gap: "6px" }}
              >
                <span
                  style={{
                    color: OG.accent,
                    fontSize: "40px",
                    fontWeight: 800,
                  }}
                >
                  {formatRunPace(data.bestPace.pace)}
                </span>
                <span style={{ color: OG.muted, fontSize: "18px" }}>/km</span>
              </span>
              <span
                style={{ color: OG.text, fontSize: "19px", fontWeight: 600 }}
              >
                {data.bestPace.name}
              </span>
              <span style={{ color: OG.muted, fontSize: "16px" }}>
                sur {km(data.bestPace.distance)} km
              </span>
            </div>
          )}
        </div>

        {/* ── Records de la semaine ────────────────────────── */}
        {records.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px 18px",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: `${OG.gold}1f`,
              border: `1px solid ${OG.gold}55`,
              fontSize: "17px",
            }}
          >
            <span style={{ color: OG.gold, fontWeight: 800 }}>
              🏆 {data.records.length > 1 ? "RECORDS" : "RECORD"}
            </span>
            {records.map((r) => (
              <span
                key={`${r.name}-${r.distance}`}
                style={{ display: "flex", gap: "6px" }}
              >
                <span style={{ color: OG.text, fontWeight: 700 }}>
                  {r.name}
                </span>
                <span style={{ color: OG.muted }}>
                  {PR_DISTANCE_LABELS[r.distance]}
                </span>
                <span style={{ color: OG.gold }}>
                  {formatRunDurationDisplay(r.duration)}
                </span>
              </span>
            ))}
            {hiddenRecords > 0 && (
              <span style={{ color: OG.muted }}>+{hiddenRecords}</span>
            )}
          </div>
        )}
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
