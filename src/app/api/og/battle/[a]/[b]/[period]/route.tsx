import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

import {
  BATTLE_PERIOD_PHRASES,
  type BattleLine,
  computeBattle,
} from "@/app/(app)/compare/_utils/battle"
import { getComparison } from "@/app/(app)/compare/_utils/comparison"
import { prisma } from "@/lib/db/prisma"
import { OG, OgHeader } from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"
import { STATS_PERIODS } from "@/lib/stats/periods"
import { displayName } from "@/lib/utils/display-name"

export const runtime = "nodejs"

// 5 stats + 5 records : tout tient sous le score, même sans ligne vide à masquer.
const MAX_LINES = 10

/**
 * Image du résultat d'une bataille (`a` = celui qui publie), recalculée comme sur /compare.
 * `?at=yyyy-MM-dd` : jour de publication, où se termine la période (les records restent
 * ceux d'aujourd'hui : leur historique n'est pas conservé).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ a: string; b: string; period: string }> },
) {
  const { a, b, period: rawPeriod } = await params
  const period = STATS_PERIODS.find((p) => p.value === rawPeriod)?.value
  const rawAt = request.nextUrl.searchParams.get("at")
  const at = rawAt ? new Date(rawAt) : new Date()
  if (!period || a === b || Number.isNaN(at.getTime()))
    return new Response("Bad request", { status: 400 })

  const users = await prisma.user.findMany({
    where: { id: { in: [a, b] } },
    select: { id: true, name: true, username: true, displayUsername: true },
  })
  const userA = users.find((u) => u.id === a)
  const userB = users.find((u) => u.id === b)
  if (!userA || !userB)
    return ogUnavailable("Bataille", "Un des deux membres a quitté le groupe.")

  const battle = computeBattle(await getComparison(a, b, period, at))
  // Une ligne vide des deux côtés ne rapporte aucun point : inutile de la dessiner.
  const lines = [...battle.stats, ...battle.records]
    .filter((l) => l.meText !== "—" || l.otherText !== "—")
    .slice(0, MAX_LINES)
  const winnerName =
    battle.winner === "me"
      ? displayName(userA)
      : battle.winner === "other"
        ? displayName(userB)
        : null

  const sideColor = (side: "me" | "other") =>
    battle.winner === side ? OG.gold : OG.text
  const cell = (l: BattleLine, side: "me" | "other") => (
    <span
      style={{
        display: "flex",
        flex: 1,
        justifyContent: side === "me" ? "flex-end" : "flex-start",
        color: l.winner === side ? OG.brand : OG.muted,
        fontWeight: l.winner === side ? 700 : 400,
      }}
    >
      {side === "me" ? l.meText : l.otherText}
    </span>
  )

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
        title="Bataille"
        subtitle={BATTLE_PERIOD_PHRASES[period]}
        right={winnerName ? `🏆 ${winnerName}` : "Match nul"}
      />

      {/* ── Score ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "150px",
          flexShrink: 0,
          padding: "0 48px",
          borderBottom: `1px solid ${OG.border}`,
        }}
      >
        <span
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            color: sideColor("me"),
            fontSize: "40px",
            fontWeight: 800,
          }}
        >
          {displayName(userA)}
        </span>
        <span
          style={{
            display: "flex",
            gap: "20px",
            margin: "0 40px",
            fontSize: "88px",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          <span style={{ color: sideColor("me") }}>{battle.score.me}</span>
          <span style={{ color: OG.muted }}>–</span>
          <span style={{ color: sideColor("other") }}>
            {battle.score.other}
          </span>
        </span>
        <span
          style={{
            display: "flex",
            flex: 1,
            color: sideColor("other"),
            fontSize: "40px",
            fontWeight: 800,
          }}
        >
          {displayName(userB)}
        </span>
      </div>

      {/* ── Lignes du duel ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: "6px",
          padding: "0 120px",
          backgroundColor: OG.panel,
          fontSize: "22px",
        }}
      >
        {lines.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center" }}>
            {cell(l, "me")}
            <span
              style={{
                display: "flex",
                justifyContent: "center",
                width: "260px",
                color: OG.text,
                fontSize: "18px",
                letterSpacing: "1px",
              }}
            >
              {l.label.toUpperCase()}
            </span>
            {cell(l, "other")}
          </div>
        ))}
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
