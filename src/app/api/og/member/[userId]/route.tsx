import { ImageResponse } from "next/og"

import { prisma } from "@/lib/db/prisma"
import { fetchImage } from "@/lib/og/fetch-tiles"
import { OG } from "@/lib/og/theme"
import { ogUnavailable } from "@/lib/og/unavailable"
import { displayName } from "@/lib/utils/display-name"

export const runtime = "nodejs"

const AVATAR = 220

/** Carte de bienvenue d'un nouveau membre : bannière en fond, avatar au centre. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      displayUsername: true,
      image: true,
      bannerImage: true,
    },
  })
  if (!user)
    return ogUnavailable("Nouveau membre", "Ce membre a quitté le groupe.")

  const [avatar, banner] = await Promise.all([
    fetchImage(user.image, AVATAR),
    fetchImage(user.bannerImage, OG.width),
  ])
  const name = displayName(user)

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: OG.bg,
        fontFamily: "sans-serif",
      }}
    >
      {banner && (
        // biome-ignore lint/performance/noImgElement: rendu par Satori
        <img
          src={banner}
          alt=""
          width={OG.width}
          height={OG.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      )}
      {/* Assombrit la bannière, ou dessine un halo de marque sans bannière. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: banner
            ? "linear-gradient(rgba(9,9,11,0.55), rgba(9,9,11,0.85))"
            : `radial-gradient(circle at 50% 40%, ${OG.brand}40, ${OG.bg} 65%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
        }}
      >
        {avatar ? (
          // biome-ignore lint/performance/noImgElement: rendu par Satori
          <img
            src={avatar}
            alt=""
            width={AVATAR}
            height={AVATAR}
            style={{
              borderRadius: "9999px",
              border: `6px solid ${OG.brand}`,
              objectFit: "cover",
            }}
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
              fontSize: "110px",
              fontWeight: 800,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ color: OG.text, fontSize: "64px", fontWeight: 800 }}>
          Bienvenue {name} !
        </span>
        <span style={{ color: OG.muted, fontSize: "26px" }}>
          Nouveau membre de Run Together
        </span>
      </div>

      <span
        style={{
          position: "absolute",
          top: 32,
          right: 32,
          color: OG.accent,
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: "3px",
        }}
      >
        RUN TOGETHER
      </span>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
