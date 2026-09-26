import { ImageResponse } from "next/og"

import { BADGES } from "@/lib/badges/catalog"
import { prisma } from "@/lib/db/prisma"
import { OG, OG_BADGE_TONES, OgHeader } from "@/lib/og/theme"

export const runtime = "nodejs"

// Au-delà, on résume par « +N » pour garder des médailles lisibles.
const MAX_SHOWN = 4

/** Badges débloqués par une course (image de l'embed `badge.unlocked`). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params

  const run = await prisma.run.findUnique({
    where: { id: runId },
    select: {
      name: true,
      user: { select: { name: true } },
      badges: { select: { badgeKey: true }, orderBy: { unlockedAt: "asc" } },
    },
  })
  const badges = (run?.badges ?? []).flatMap(
    ({ badgeKey }) => BADGES.find((b) => b.key === badgeKey) ?? [],
  )
  if (!run || badges.length === 0)
    return new Response("Not found", { status: 404 })

  const shown = badges.slice(0, MAX_SHOWN)
  const hidden = badges.length - shown.length
  // Une seule médaille : grande et centrée ; plusieurs : une rangée.
  const medal = shown.length === 1 ? 200 : 140

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
        title={run.user.name}
        subtitle={run.name ?? "Course sans nom"}
        right={
          badges.length > 1
            ? `${badges.length} badges débloqués`
            : "Badge débloqué"
        }
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          // Médailles alignées en haut même si les descriptions n'ont pas la même longueur.
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "40px",
          paddingTop: shown.length === 1 ? "72px" : "110px",
          paddingLeft: "40px",
          paddingRight: "40px",
          backgroundColor: OG.panel,
        }}
      >
        {shown.map((b) => {
          const tone = OG_BADGE_TONES[b.category]
          return (
            <div
              key={b.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                width: shown.length === 1 ? "640px" : "230px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: `${medal}px`,
                  height: `${medal}px`,
                  borderRadius: "9999px",
                  backgroundColor: `${tone}26`,
                  border: `4px solid ${tone}99`,
                  fontSize: `${Math.round(medal * 0.45)}px`,
                }}
              >
                {b.emoji}
              </div>
              <span
                style={{
                  color: OG.text,
                  fontSize: shown.length === 1 ? "44px" : "28px",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                {b.name}
              </span>
              <span
                style={{
                  color: OG.muted,
                  fontSize: shown.length === 1 ? "24px" : "18px",
                  textAlign: "center",
                }}
              >
                {b.description}
              </span>
            </div>
          )
        })}
        {hidden > 0 && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              height: `${medal}px`,
              color: OG.muted,
              fontSize: "40px",
              fontWeight: 800,
            }}
          >
            +{hidden}
          </span>
        )}
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
