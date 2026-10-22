import { ImageResponse } from "next/og"

import { OG, OgHeader } from "@/lib/og/theme"

export const runtime = "nodejs"

/** Image du test de webhook : si Discord l'affiche, les images OG sont joignables. */
export function GET() {
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
      <OgHeader title="Test du webhook" subtitle="Administration" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          gap: "20px",
          backgroundColor: OG.panel,
        }}
      >
        <span style={{ fontSize: "120px", lineHeight: 1 }}>✅</span>
        <span style={{ color: OG.text, fontSize: "52px", fontWeight: 800 }}>
          Webhook opérationnel
        </span>
        <span style={{ color: OG.muted, fontSize: "24px" }}>
          Cette image s'affiche : Discord joint bien les images de l'app.
        </span>
      </div>
    </div>,
    { width: OG.width, height: OG.height },
  )
}
