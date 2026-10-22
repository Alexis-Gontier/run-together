import { ImageResponse } from "next/og"

import { OG, OgHeader } from "./theme"

/**
 * Image de remplacement quand ce qu'un message montrait n'existe plus (course supprimée…).
 * Discord recharge les images des anciens messages : une 404 y laisserait une image cassée.
 */
export function ogUnavailable(title: string, message: string): ImageResponse {
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
      <OgHeader title={title} subtitle="Contenu indisponible" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          backgroundColor: OG.panel,
        }}
      >
        <span style={{ color: OG.muted, fontSize: "40px", fontWeight: 700 }}>
          {message}
        </span>
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
