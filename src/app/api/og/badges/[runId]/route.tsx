import { ImageResponse } from "next/og"

import { BADGE_CATEGORIES, BADGES, type BadgeDef } from "@/lib/badges/catalog"
import { prisma } from "@/lib/db/prisma"
import { badgeIconSrc } from "@/lib/og/badge-icon"
import { fetchImage } from "@/lib/og/fetch-tiles"
import { OG, OG_BADGE_TONES, OG_MAX_BADGES } from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"
import { displayName } from "@/lib/utils/display-name"

export const runtime = "nodejs"

// Layout : panneau du coureur à gauche (comme l'image de course), médailles à droite.
const PANEL_W = 430
const PANEL_PAD = 44
const AVATAR = 56

const categoryLabel = (badge: BadgeDef) =>
  BADGE_CATEGORIES.find((c) => c.key === badge.category)?.label ?? ""

function Medal({ badge, size }: { badge: BadgeDef; size: number }) {
  const tone = OG_BADGE_TONES[badge.category]
  const icon = Math.round(size * 0.46)
  const src = badgeIconSrc(badge.icon, tone, icon)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        backgroundColor: `${tone}26`,
        border: `3px solid ${tone}99`,
        boxShadow: `0 0 ${Math.round(size / 3)}px ${tone}40`,
      }}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: rendu par Satori
        <img src={src} alt="" width={icon} height={icon} />
      ) : (
        <span style={{ fontSize: `${icon}px` }}>{badge.emoji}</span>
      )}
    </div>
  )
}

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
      date: true,
      userId: true,
      user: {
        select: {
          name: true,
          username: true,
          displayUsername: true,
          image: true,
        },
      },
      badges: { select: { badgeKey: true }, orderBy: { unlockedAt: "asc" } },
    },
  })
  const badges = (run?.badges ?? []).flatMap(
    ({ badgeKey }) => BADGES.find((b) => b.key === badgeKey) ?? [],
  )
  if (!run || badges.length === 0)
    return ogUnavailable(
      "Badges",
      "Ces badges ne sont plus rattachés à la course.",
    )

  const [owned, avatar] = await Promise.all([
    prisma.userBadge.count({ where: { userId: run.userId } }),
    fetchImage(run.user.image, AVATAR * 2),
  ])

  const name = displayName(run.user)
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(run.date)
  const shown = badges.slice(0, OG_MAX_BADGES)
  const hidden = badges.length - shown.length
  const glow = OG_BADGE_TONES[badges[0].category]
  // Lignes plus serrées quand il y en a beaucoup.
  const medal = shown.length > 3 ? 76 : shown.length > 2 ? 92 : 112

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
      {/* ── Panneau du coureur ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: `${PANEL_W}px`,
          height: "100%",
          padding: `${PANEL_PAD}px`,
          borderRight: `1px solid ${OG.border}`,
        }}
      >
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

        {/* Nombre de badges de cette course */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              color: OG.gold,
              fontSize: "150px",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {badges.length}
          </span>
          <span style={{ color: OG.text, fontSize: "32px", fontWeight: 700 }}>
            {badges.length > 1 ? "badges débloqués" : "badge débloqué"}
          </span>
          <span style={{ color: OG.muted, fontSize: "19px" }}>
            {run.name ? `sur « ${run.name} »` : "sur sa dernière course"}
          </span>
        </div>

        {/* Collection du coureur */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "36px",
            paddingTop: "24px",
            borderTop: `1px solid ${OG.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
            }}
          >
            <span
              style={{ color: OG.muted, fontWeight: 700, letterSpacing: "2px" }}
            >
              COLLECTION
            </span>
            <span style={{ color: OG.text, fontWeight: 700 }}>
              {owned} / {BADGES.length}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: OG.border,
            }}
          >
            <div
              style={{
                width: `${Math.max(3, (owned / BADGES.length) * 100)}%`,
                borderRadius: "9999px",
                backgroundColor: OG.gold,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Médailles ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: shown.length > 3 ? "18px" : shown.length > 2 ? "26px" : "40px",
          padding: "0 64px",
          backgroundColor: OG.panel,
          backgroundImage: `linear-gradient(135deg, ${glow}24, ${OG.panel} 65%)`,
        }}
      >
        {shown.length === 1 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              textAlign: "center",
            }}
          >
            <Medal badge={shown[0]} size={220} />
            <span
              style={{
                marginTop: "12px",
                color: OG_BADGE_TONES[shown[0].category],
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "3px",
              }}
            >
              {categoryLabel(shown[0]).toUpperCase()}
            </span>
            <span style={{ color: OG.text, fontSize: "54px", fontWeight: 800 }}>
              {shown[0].name}
            </span>
            <span
              style={{ color: OG.muted, fontSize: "24px", maxWidth: "560px" }}
            >
              {shown[0].description}
            </span>
          </div>
        ) : (
          shown.map((b) => (
            <div
              key={b.key}
              style={{ display: "flex", alignItems: "center", gap: "28px" }}
            >
              <Medal badge={b} size={medal} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    color: OG_BADGE_TONES[b.category],
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                  }}
                >
                  {categoryLabel(b).toUpperCase()}
                </span>
                <span
                  style={{
                    color: OG.text,
                    fontSize:
                      shown.length > 3
                        ? "26px"
                        : shown.length > 2
                          ? "30px"
                          : "36px",
                    fontWeight: 800,
                  }}
                >
                  {b.name}
                </span>
                <span
                  style={{
                    color: OG.muted,
                    fontSize:
                      shown.length > 3
                        ? "16px"
                        : shown.length > 2
                          ? "18px"
                          : "21px",
                  }}
                >
                  {b.description}
                </span>
              </div>
            </div>
          ))
        )}
        {hidden > 0 && (
          <span style={{ color: OG.muted, fontSize: "22px", fontWeight: 700 }}>
            + {hidden} autre{hidden > 1 ? "s" : ""} badge{hidden > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
