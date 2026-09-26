import type { BadgeCategory } from "@/lib/badges/catalog"

/** Palette commune aux images OG (embeds Discord) : fond noir, accents de l'app. */
export const OG = {
  width: 1200,
  height: 630,
  bg: "#09090b",
  panel: "#111113",
  border: "#27272a",
  text: "#fafafa",
  muted: "#71717a",
  brand: "#10b981",
  accent: "#FC4C02",
  gold: "#f59e0b",
} as const

// Mêmes teintes que `BadgeMedal`, en hexadécimal pour Satori.
export const OG_BADGE_TONES: Record<BadgeCategory, string> = {
  distance: "#10b981",
  runs: "#0ea5e9",
  elevation: "#f97316",
  single: "#8b5cf6",
  streak: "#14b8a6",
  moments: "#ec4899",
  records: "#f59e0b",
  fun: "#d946ef",
  group: "#818cf8",
}

export const OG_HEADER_H = 88

/** En-tête : titre + sous-titre à gauche, marque + date à droite. */
export function OgHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: `${OG_HEADER_H}px`,
        padding: "0 32px",
        borderBottom: `1px solid ${OG.border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ color: OG.text, fontSize: "22px", fontWeight: 700 }}>
          {title}
        </span>
        {subtitle && (
          <span style={{ color: OG.muted, fontSize: "16px" }}>{subtitle}</span>
        )}
      </div>
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
            color: OG.accent,
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "3px",
          }}
        >
          RUN TOGETHER
        </span>
        {right && (
          <span style={{ color: OG.muted, fontSize: "15px" }}>{right}</span>
        )}
      </div>
    </div>
  )
}
