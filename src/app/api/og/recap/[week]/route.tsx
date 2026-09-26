import { ImageResponse } from "next/og"

import { formatWeekRange } from "@/lib/discord/embeds/weekly-recap"
import { getWeeklyRecapData } from "@/lib/discord/recap"
import { OG, OgHeader } from "@/lib/og/theme"

export const runtime = "nodejs"

const DAY = 24 * 60 * 60 * 1000
const PODIUM = ["#fbbf24", "#d4d4d8", "#d97706"]

const km = (meters: number, digits = 1) =>
  (meters / 1000).toFixed(digits).replace(".", ",")

function pace(secondsPerKm: number) {
  const m = Math.floor(secondsPerKm / 60)
  const s = secondsPerKm % 60
  return `${m}'${String(s).padStart(2, "0")}"`
}

/** Image du récap hebdo. `week` = lundi 00:00 UTC de la semaine, `yyyy-MM-dd`. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ week: string }> },
) {
  const { week } = await params
  const start = new Date(`${week}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || Number.isNaN(start.getTime()))
    return new Response("Bad request", { status: 400 })

  const data = await getWeeklyRecapData(
    start,
    new Date(start.getTime() + 7 * DAY),
  )
  if (!data) return new Response("Not found", { status: 404 })

  const totals = [
    { value: km(data.totalDistance), unit: "km au total" },
    {
      value: String(data.totalRuns),
      unit: data.totalRuns > 1 ? "courses" : "course",
    },
    {
      value: String(data.runners),
      unit: data.runners > 1 ? "coureurs" : "coureur",
    },
  ]
  const max = data.topDistance[0]?.distance ?? 1

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: OG.bg,
        fontFamily: "sans-serif",
      }}
    >
      <OgHeader
        title="Récap de la semaine"
        subtitle={formatWeekRange(data.weekStart, data.weekEnd)}
        right={
          data.records.length > 0
            ? `🏆 ${data.records.length} record${data.records.length > 1 ? "s" : ""}`
            : undefined
        }
      />

      <div style={{ display: "flex", flex: 1 }}>
        {/* ── Totaux du groupe ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "28px",
            width: "400px",
            padding: "0 48px",
            borderRight: `1px solid ${OG.border}`,
          }}
        >
          {totals.map((t, i) => (
            <div
              key={t.unit}
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span
                style={{
                  color: i === 0 ? OG.brand : OG.text,
                  fontSize: i === 0 ? "88px" : "56px",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {t.value}
              </span>
              <span style={{ color: OG.muted, fontSize: "20px" }}>
                {t.unit}
              </span>
            </div>
          ))}
        </div>

        {/* ── Podium distance ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "28px",
            padding: "0 56px",
            backgroundColor: OG.panel,
          }}
        >
          <span
            style={{
              color: OG.muted,
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "3px",
            }}
          >
            PODIUM DISTANCE
          </span>
          {data.topDistance.map((r, i) => (
            <div
              key={r.name}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "26px",
                }}
              >
                <span style={{ color: OG.text, fontWeight: 700 }}>
                  {i + 1}. {r.name}
                </span>
                <span style={{ color: OG.text }}>{km(r.distance, 2)} km</span>
              </div>
              <div
                style={{
                  display: "flex",
                  height: "14px",
                  borderRadius: "9999px",
                  backgroundColor: OG.border,
                }}
              >
                <div
                  style={{
                    width: `${Math.max(4, (r.distance / max) * 100)}%`,
                    borderRadius: "9999px",
                    backgroundColor: PODIUM[i],
                  }}
                />
              </div>
            </div>
          ))}
          {data.bestPace && (
            <span
              style={{ display: "flex", color: OG.muted, fontSize: "20px" }}
            >
              ⚡ Meilleure allure :{" "}
              <span
                style={{ color: OG.text, fontWeight: 700, margin: "0 8px" }}
              >
                {data.bestPace.name}
              </span>
              {pace(data.bestPace.pace)} /km
            </span>
          )}
        </div>
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
