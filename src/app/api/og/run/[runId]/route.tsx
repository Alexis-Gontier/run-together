import { ImageResponse } from "next/og"

import { prisma } from "@/lib/db/prisma"
import {
  MAP_ATTRIBUTION,
  type MapTile,
  mapViewport,
  tileUrl,
} from "@/lib/maps/raster-tiles"
import { fetchTiles } from "@/lib/og/fetch-tiles"
import { OG, OG_HEADER_H, OgHeader } from "@/lib/og/theme"
import { PR_DISTANCE_LABELS, PR_DISTANCE_ORDER } from "@/lib/runs/pr-display"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { routeSvgPath } from "@/lib/runs/track/route-svg"

export const runtime = "nodejs"

const BG = OG.bg
const BORDER = OG.border
const TEXT = OG.text
const MUTED = OG.muted
const ORANGE = OG.accent
const ROUTE = OG.brand
const MAP_BG = OG.panel
const MAP_TINT = "rgba(16, 36, 84, 0.5)"
const MAP_PADDING = 48
// Assez de points pour un tracé lisse, assez peu pour garder le SVG léger.
const MAX_ROUTE_POINTS = 400

// Heights
const STATS_H = 120
const RECORDS_H = 56
const MAP_H = OG.height - OG_HEADER_H - STATS_H // 422

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

function TileLayer({ tiles, srcs }: { tiles: MapTile[]; srcs: string[] }) {
  return (
    <>
      {tiles.map((t, i) => (
        // biome-ignore lint/performance/noImgElement: rendu par Satori
        <img
          key={`${t.z}-${t.x}-${t.y}`}
          src={srcs[i]}
          alt=""
          width={t.size}
          height={t.size}
          style={{ position: "absolute", left: t.left, top: t.top }}
        />
      ))}
    </>
  )
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
      personalRecords: { select: { distance: true, duration: true } },
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
  const records = [...run.personalRecords].sort(
    (a, b) =>
      PR_DISTANCE_ORDER.indexOf(a.distance) -
      PR_DISTANCE_ORDER.indexOf(b.distance),
  )
  const recordsH = records.length > 0 ? RECORDS_H : 0
  const mapH = MAP_H - extraH - recordsH

  const encoded = run.polyline ?? run.summaryPolyline
  const decoded = encoded ? decodePolyline(encoded) : []
  const step = Math.max(1, Math.ceil(decoded.length / MAX_ROUTE_POINTS))
  const points = decoded.filter(
    (_, i) => i % step === 0 || i === decoded.length - 1,
  )

  // Fond de carte en tuiles raster sous le tracé ; sans tuiles, tracé seul en SVG.
  const viewport = mapViewport(points, OG.width, mapH, MAP_PADDING)
  const [tiles, labels] = viewport
    ? await Promise.all([
        fetchTiles(viewport.tiles.map((t) => tileUrl(t.z, t.x, t.y))),
        fetchTiles(
          viewport.labelTiles.map((t) =>
            tileUrl(t.z, t.x, t.y, "dark", "labels"),
          ),
        ),
      ])
    : [null, null]
  let route: {
    path: string
    start: { x: number; y: number }
    end: { x: number; y: number }
  } | null = tiles && viewport ? viewport : null
  if (!route) {
    const path = routeSvgPath(points, OG.width, mapH, MAP_PADDING)
    const ends = path
      ?.split(" L")
      .filter((_, i, all) => i === 0 || i === all.length - 1)
      .map((pt) => pt.replace("M", "").split(" ").map(Number))
    if (path && ends)
      route = {
        path,
        start: { x: ends[0][0], y: ends[0][1] },
        end: { x: ends[ends.length - 1][0], y: ends[ends.length - 1][1] },
      }
  }

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
      <OgHeader
        title={run.user.name ?? "Inconnu"}
        subtitle={run.name ?? "Course sans nom"}
        right={formattedDate}
      />

      {/* ── Records personnels battus par cette course ───── */}
      {records.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            height: `${recordsH}px`,
            flexShrink: 0,
            backgroundColor: `${OG.gold}1f`,
            borderBottom: `1px solid ${OG.gold}55`,
          }}
        >
          <span style={{ color: OG.gold, fontSize: "20px", fontWeight: 800 }}>
            🏆 {records.length > 1 ? "RECORDS PERSO" : "RECORD PERSO"}
          </span>
          {records.map((r) => (
            <span
              key={r.distance}
              style={{ display: "flex", gap: "8px", fontSize: "20px" }}
            >
              <span style={{ color: MUTED }}>·</span>
              <span style={{ color: TEXT, fontWeight: 700 }}>
                {PR_DISTANCE_LABELS[r.distance]}
              </span>
              <span style={{ color: OG.gold }}>
                {formatDuration(r.duration)}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────── */}
      {route ? (
        <div
          style={{
            display: "flex",
            position: "relative",
            height: `${mapH}px`,
            flexShrink: 0,
            overflow: "hidden",
            backgroundColor: MAP_BG,
          }}
        >
          {tiles && viewport && (
            <TileLayer tiles={viewport.tiles} srcs={tiles} />
          )}
          {tiles && (
            // Teinte bleu nuit sur le gris Esri (et assombrit pour faire ressortir le tracé).
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: MAP_TINT,
              }}
            />
          )}
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: rendu par Satori, qui afficherait <title> comme du texte */}
          <svg
            width={OG.width}
            height={mapH}
            viewBox={`0 0 ${OG.width} ${mapH}`}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <path
              d={route.path}
              fill="none"
              stroke={ROUTE}
              strokeOpacity={0.25}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={route.path}
              fill="none"
              stroke={ROUTE}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={route.start.x} cy={route.start.y} r={10} fill={TEXT} />
            <circle cx={route.end.x} cy={route.end.y} r={10} fill={ORANGE} />
          </svg>
          {tiles && labels && viewport && (
            <TileLayer tiles={viewport.labelTiles} srcs={labels} />
          )}
          {tiles && (
            <span
              style={{
                position: "absolute",
                right: 8,
                bottom: 6,
                color: MUTED,
                fontSize: "11px",
              }}
            >
              {MAP_ATTRIBUTION}
            </span>
          )}
        </div>
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
