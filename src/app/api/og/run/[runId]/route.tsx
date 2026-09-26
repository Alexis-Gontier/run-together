import { ImageResponse } from "next/og"

import { prisma } from "@/lib/db/prisma"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { routeSvgPath } from "@/lib/runs/track/route-svg"

export const runtime = "nodejs"

const BG = "#09090b"
const BORDER = "#27272a"
const TEXT = "#fafafa"
const MUTED = "#71717a"
const ORANGE = "#FC4C02"
const ROUTE = "#10b981"
const MAP_BG = "#111113"
const MAP_PADDING = 48
// Assez de points pour un tracé lisse, assez peu pour garder le SVG léger.
const MAX_ROUTE_POINTS = 400

// Heights
const HEADER_H = 88
const STATS_H = 120
const MAP_H = 630 - HEADER_H - STATS_H // 422

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatPace(paceSecondsPerKm: number): string {
  const m = Math.floor(paceSecondsPerKm / 60)
  const s = paceSecondsPerKm % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params

  const run = await prisma.run.findUnique({
    where: { id: runId },
    select: {
      name: true,
      distance: true,
      duration: true,
      pace: true,
      elevation: true,
      heartRateAvg: true,
      cadenceAvg: true,
      calories: true,
      date: true,
      summaryPolyline: true,
      polyline: true,
      user: { select: { name: true } },
    },
  })

  if (!run) return new Response("Not found", { status: 404 })

  const km = (run.distance / 1000).toFixed(2)
  const duration = formatDuration(run.duration)
  const pace = formatPace(run.pace)
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(run.date))

  const stats = [
    { value: km, unit: "km" },
    { value: pace, unit: "/km" },
    { value: duration, unit: "durée" },
    { value: `+${run.elevation}m`, unit: "D+" },
  ]

  const hasExtra = !!(run.heartRateAvg || run.cadenceAvg || run.calories)
  const extraH = hasExtra ? 52 : 0
  const mapH = MAP_H - extraH

  // Tracé dessiné en SVG à partir de la polyline : aucun service de carte externe.
  const encoded = run.polyline ?? run.summaryPolyline
  const decoded = encoded ? decodePolyline(encoded) : []
  const step = Math.max(1, Math.ceil(decoded.length / MAX_ROUTE_POINTS))
  const points = decoded.filter(
    (_, i) => i % step === 0 || i === decoded.length - 1,
  )
  const routePath = routeSvgPath(points, 1200, mapH, MAP_PADDING)
  const endpoints = routePath
    ?.split(" L")
    .filter((_, i, all) => i === 0 || i === all.length - 1)
    .map((p) => p.replace("M", "").split(" ").map(Number))

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        fontFamily: "sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: `${HEADER_H}px`,
          padding: "0 32px",
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        {/* Left: user + run name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ color: TEXT, fontSize: "22px", fontWeight: 700 }}>
            {run.user.name ?? "Inconnu"}
          </span>
          <span style={{ color: MUTED, fontSize: "16px" }}>
            {run.name ?? "Course sans nom"}
          </span>
        </div>

        {/* Right: date + brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <span
            style={{
              color: ORANGE,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "3px",
            }}
          >
            RUN TOGETHER
          </span>
          <span style={{ color: MUTED, fontSize: "15px" }}>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────── */}
      {routePath && endpoints ? (
        // biome-ignore lint/a11y/noSvgWithoutTitle: rendu par Satori, qui afficherait <title> comme du texte
        <svg
          width={1200}
          height={mapH}
          viewBox={`0 0 1200 ${mapH}`}
          style={{ flexShrink: 0, backgroundColor: MAP_BG }}
        >
          <path
            d={routePath}
            fill="none"
            stroke={ROUTE}
            strokeOpacity={0.25}
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={routePath}
            fill="none"
            stroke={ROUTE}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={endpoints[0][0]}
            cy={endpoints[0][1]}
            r={10}
            fill={TEXT}
          />
          <circle
            cx={endpoints[endpoints.length - 1][0]}
            cy={endpoints[endpoints.length - 1][1]}
            r={10}
            fill={ORANGE}
          />
        </svg>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: `${mapH}px`,
            flexShrink: 0,
            backgroundColor: MAP_BG,
          }}
        >
          <span style={{ color: TEXT, fontSize: "120px", fontWeight: 800 }}>
            {km}
          </span>
          <span
            style={{ color: MUTED, fontSize: "24px", letterSpacing: "4px" }}
          >
            KILOMÈTRES
          </span>
        </div>
      )}

      {/* ── Extra stats (HR / cadence / calories) ──────────── */}
      {hasExtra && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "48px",
            height: `${extraH}px`,
            flexShrink: 0,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          {run.heartRateAvg && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: MUTED,
                fontSize: "16px",
              }}
            >
              <span style={{ color: "#f43f5e", fontSize: "18px" }}>♥</span>
              <span style={{ color: TEXT, fontWeight: 600 }}>
                {run.heartRateAvg}
              </span>{" "}
              bpm
            </span>
          )}
          {run.cadenceAvg && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: MUTED,
                fontSize: "16px",
              }}
            >
              <span style={{ color: "#3b82f6", fontSize: "18px" }}>◎</span>
              <span style={{ color: TEXT, fontWeight: 600 }}>
                {run.cadenceAvg}
              </span>{" "}
              spm
            </span>
          )}
          {run.calories && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: MUTED,
                fontSize: "16px",
              }}
            >
              <span style={{ color: "#f97316", fontSize: "18px" }}>🔥</span>
              <span style={{ color: TEXT, fontWeight: 600 }}>
                {run.calories}
              </span>{" "}
              kcal
            </span>
          )}
        </div>
      )}

      {/* ── Stats grid ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          height: `${STATS_H}px`,
          flexShrink: 0,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={s.unit}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "6px",
              borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
            }}
          >
            <span style={{ color: TEXT, fontSize: "34px", fontWeight: 700 }}>
              {s.value}
            </span>
            <span style={{ color: MUTED, fontSize: "14px" }}>{s.unit}</span>
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
