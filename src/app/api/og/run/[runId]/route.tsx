import { ImageResponse } from "next/og"

import { prisma } from "@/lib/db/prisma"

export const runtime = "nodejs"

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
  return `${m}:${String(s).padStart(2, "0")}/km`
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
      date: true,
      user: { select: { name: true } },
    },
  })

  if (!run) {
    return new Response("Not found", { status: 404 })
  }

  const km = (run.distance / 1000).toFixed(2)
  const duration = formatDuration(run.duration)
  const pace = formatPace(run.pace)
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(run.date))

  const stats: { label: string; value: string }[] = [
    { label: "Distance", value: `${km} km` },
    { label: "Durée", value: duration },
    { label: "Allure", value: pace },
    { label: "Dénivelé", value: `+${run.elevation} m` },
    ...(run.heartRateAvg
      ? [{ label: "FC moy.", value: `${run.heartRateAvg} bpm` }]
      : []),
  ]

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#111111",
        padding: "56px 64px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#FC4C02",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "4px",
          }}
        >
          RUN TOGETHER
        </span>
        <span style={{ color: "#444444", fontSize: "18px" }}>
          {formattedDate}
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, display: "flex" }} />

      {/* User + Run name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "44px",
        }}
      >
        <span
          style={{
            color: "#666666",
            fontSize: "22px",
            marginBottom: "10px",
          }}
        >
          {run.user.name ?? "Inconnu"}
        </span>
        <span
          style={{
            color: "#ffffff",
            fontSize: "54px",
            fontWeight: 700,
            lineHeight: 1.1,
            overflow: "hidden",
          }}
        >
          {run.name ?? "Course sans nom"}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#222222",
          marginBottom: "32px",
        }}
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: "0px" }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              paddingLeft: "20px",
              borderLeft: `2px solid ${i === 0 ? "#FC4C02" : "#222222"}`,
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "34px",
                fontWeight: 700,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                color: "#555555",
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
