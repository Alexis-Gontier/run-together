import { ImageResponse } from "next/og"

import { prisma } from "@/lib/db/prisma"
import {
  MAP_ATTRIBUTION,
  type MapTile,
  mapViewport,
  tileUrl,
} from "@/lib/maps/raster-tiles"
import { fetchImage, fetchTiles } from "@/lib/og/fetch-tiles"
import { OG } from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { routeSvgPath } from "@/lib/runs/track/route-svg"
import { displayName } from "@/lib/utils/display-name"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"

export const runtime = "nodejs"

// Layout : carte pleine hauteur à gauche, panneau de stats à droite.
const MAP_W = 660
const PANEL_W = OG.width - MAP_W
const PANEL_PAD = 44
const FULL_PAD = 64
const MAP_PADDING = 56
const MAP_TINT = "rgba(9, 9, 11, 0.35)"
// Assez de points pour un tracé lisse, assez peu pour garder le SVG léger.
const MAX_ROUTE_POINTS = 400
const AVATAR = 56
const MAX_NAME = 44

const SPORT_LABELS: Record<string, string> = {
  TrailRun: "Trail",
  VirtualRun: "Tapis",
}

const km = (meters: number) => (meters / 1000).toFixed(2).replace(".", ",")

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

/** Sans tracé GPS (tapis, montre sans GPS) : allure de chaque kilomètre en barres. */
function SplitBars({
  splits,
}: {
  splits: { kilometer: number; pace: number }[]
}) {
  const paces = splits.map((s) => s.pace)
  const fastest = Math.min(...paces)
  const slowest = Math.max(...paces)
  const range = Math.max(1, slowest - fastest)
  const step = Math.ceil(splits.length / 12)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        height: "100%",
        padding: `${MAP_PADDING}px`,
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "16px",
        }}
      >
        <span
          style={{ color: OG.muted, fontWeight: 700, letterSpacing: "3px" }}
        >
          ALLURE PAR KILOMÈTRE
        </span>
        {/* Légende de la barre orange */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: OG.muted,
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "3px",
              backgroundColor: OG.accent,
            }}
          />
          plus rapide : {formatRunPace(fastest)} /km
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          height: "360px",
        }}
      >
        {splits.map((s) => (
          <div
            key={s.kilometer}
            style={{
              display: "flex",
              flex: 1,
              // Plus rapide = plus haut.
              height: `${40 + ((slowest - s.pace) / range) * 300}px`,
              borderRadius: "6px 6px 0 0",
              backgroundColor: s.pace === fastest ? OG.accent : OG.brand,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {splits.map((s, i) => (
          <span
            key={s.kilometer}
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              color: OG.muted,
              fontSize: "14px",
            }}
          >
            {i % step === 0 ? s.kilometer : ""}
          </span>
        ))}
      </div>
    </div>
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
      date: true,
      sportType: true,
      summaryPolyline: true,
      polyline: true,
      user: {
        select: {
          name: true,
          username: true,
          displayUsername: true,
          image: true,
        },
      },
      splits: {
        select: { kilometer: true, pace: true },
        orderBy: { kilometer: "asc" },
      },
    },
  })

  if (!run) return ogUnavailable("Course", "Cette course a été supprimée.")

  const name = displayName(run.user)
  const runName = run.name || "Course sans nom"
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(run.date)
  const sport = SPORT_LABELS[run.sportType ?? ""]

  const stats = [
    { label: "ALLURE", value: formatRunPace(run.pace), unit: "/km" },
    { label: "DURÉE", value: formatRunDurationDisplay(run.duration), unit: "" },
    ...(run.elevation > 0
      ? [{ label: "D+", value: String(run.elevation), unit: "m" }]
      : []),
  ]

  const encoded = run.polyline ?? run.summaryPolyline
  const decoded = encoded ? decodePolyline(encoded) : []
  const step = Math.max(1, Math.ceil(decoded.length / MAX_ROUTE_POINTS))
  const points = decoded.filter(
    (_, i) => i % step === 0 || i === decoded.length - 1,
  )

  // Fond de carte en tuiles raster sous le tracé ; sans tuiles, tracé seul en SVG.
  const viewport = mapViewport(points, MAP_W, OG.height, MAP_PADDING)
  const [tiles, labels, avatar] = await Promise.all([
    viewport
      ? fetchTiles(viewport.tiles.map((t) => tileUrl(t.z, t.x, t.y)))
      : null,
    viewport
      ? fetchTiles(
          viewport.labelTiles.map((t) =>
            tileUrl(t.z, t.x, t.y, "dark", "labels"),
          ),
        )
      : null,
    fetchImage(run.user.image, AVATAR * 2),
  ])
  let route: {
    path: string
    start: { x: number; y: number }
    end: { x: number; y: number }
  } | null = tiles && viewport ? viewport : null
  if (!route) {
    const path = routeSvgPath(points, MAP_W, OG.height, MAP_PADDING)
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

  // Ni tracé ni splits : rien à dessiner à gauche, le panneau prend toute l'image.
  const full = !route && run.splits.length <= 1

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
      {/* ── Carte (ou allure par km sans GPS) ─────────────── */}
      {!full && (
        <div
          style={{
            display: "flex",
            position: "relative",
            width: `${MAP_W}px`,
            height: "100%",
            overflow: "hidden",
            backgroundColor: OG.panel,
          }}
        >
          {route ? (
            <>
              {tiles && viewport && (
                <TileLayer tiles={viewport.tiles} srcs={tiles} />
              )}
              {tiles && (
                // Assombrit le gris Esri pour faire ressortir le tracé.
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
                width={MAP_W}
                height={OG.height}
                viewBox={`0 0 ${MAP_W} ${OG.height}`}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <path
                  d={route.path}
                  fill="none"
                  stroke={OG.brand}
                  strokeOpacity={0.25}
                  strokeWidth={18}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={route.path}
                  fill="none"
                  stroke={OG.brand}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={route.start.x}
                  cy={route.start.y}
                  r={11}
                  fill={OG.text}
                  stroke={OG.bg}
                  strokeWidth={3}
                />
                <circle
                  cx={route.end.x}
                  cy={route.end.y}
                  r={11}
                  fill={OG.accent}
                  stroke={OG.bg}
                  strokeWidth={3}
                />
              </svg>
              {tiles && labels && viewport && (
                <TileLayer tiles={viewport.labelTiles} srcs={labels} />
              )}
              {tiles && (
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 8,
                    color: OG.muted,
                    fontSize: "11px",
                  }}
                >
                  {MAP_ATTRIBUTION}
                </span>
              )}
            </>
          ) : (
            <SplitBars splits={run.splits} />
          )}
        </div>
      )}

      {/* ── Panneau (toute la largeur sans tracé ni splits) ──── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: `${full ? OG.width : PANEL_W}px`,
          height: "100%",
          padding: `${full ? FULL_PAD : PANEL_PAD}px`,
          ...(full
            ? {
                backgroundImage: `linear-gradient(135deg, ${OG.brand}1f, ${OG.bg} 55%)`,
              }
            : { borderLeft: `1px solid ${OG.border}` }),
        }}
      >
        {/* Coureur */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {avatar ? (
            // biome-ignore lint/performance/noImgElement: rendu par Satori
            <img
              src={avatar}
              alt=""
              width={AVATAR}
              height={AVATAR}
              style={{ borderRadius: "9999px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${AVATAR}px`,
                height: `${AVATAR}px`,
                borderRadius: "9999px",
                backgroundColor: OG.brand,
                color: OG.bg,
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color: OG.text, fontSize: "26px", fontWeight: 700 }}>
              {name}
            </span>
            <span style={{ color: OG.muted, fontSize: "17px" }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Nom de la course */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "28px",
          }}
        >
          <span style={{ color: OG.text, fontSize: "24px", fontWeight: 600 }}>
            {runName.length > MAX_NAME
              ? `${runName.slice(0, MAX_NAME - 1)}…`
              : runName}
          </span>
          {sport && (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: "9999px",
                border: `1px solid ${OG.border}`,
                color: OG.muted,
                fontSize: "15px",
              }}
            >
              {sport}
            </span>
          )}
        </div>

        {/* Distance + stats : empilées dans le panneau, côte à côte en pleine largeur. */}
        <div
          style={{
            display: "flex",
            flexDirection: full ? "row" : "column",
            alignItems: full ? "flex-end" : "stretch",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span
              style={{
                color: OG.brand,
                fontSize: full ? "200px" : "128px",
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: full ? "-6px" : "-4px",
              }}
            >
              {km(run.distance)}
            </span>
            <span
              style={{
                color: OG.muted,
                fontSize: full ? "52px" : "36px",
                fontWeight: 600,
              }}
            >
              km
            </span>
          </div>

          {/* Allure, durée, D+ */}
          <div
            style={{
              display: "flex",
              ...(full
                ? {
                    flexDirection: "column",
                    gap: "22px",
                    marginBottom: "16px",
                    paddingLeft: "48px",
                    borderLeft: `1px solid ${OG.border}`,
                  }
                : {
                    justifyContent:
                      stats.length > 2 ? "space-between" : "flex-start",
                    gap: stats.length > 2 ? "24px" : "64px",
                    marginTop: "28px",
                    paddingTop: "24px",
                    borderTop: `1px solid ${OG.border}`,
                  }),
            }}
          >
            {/* Colonnes à la largeur du contenu : une durée « 2h03'54" » ne déborde pas. */}
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    color: OG.muted,
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: OG.text,
                      fontSize: full ? "40px" : "32px",
                      fontWeight: 700,
                    }}
                  >
                    {s.value}
                  </span>
                  {s.unit && (
                    <span style={{ color: OG.muted, fontSize: "18px" }}>
                      {s.unit}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
