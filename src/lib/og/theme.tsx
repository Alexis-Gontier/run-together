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

/** Badges dessinés sur l'image `badge.unlocked` ; au-delà, « + N autres badges ». */
export const OG_MAX_BADGES = 5

/** Lignes du classement mensuel dessinées sur l'image ; l'embed liste la suite. */
export const OG_MAX_RANKING = 8

/** Records dessinés sur l'image du récap ; l'embed liste la suite. */
export const OG_MAX_RECAP_RECORDS = 3

export const OG_PODIUM = ["#fbbf24", "#d4d4d8", "#d97706"]

/** Largeur du panneau de gauche des images de groupe (récap, classement). */
export const OG_SUMMARY_W = 430

/**
 * Panneau de gauche des images de groupe, dans l'esprit du panneau de l'image de course :
 * période en haut, total de km en gros, puis courses et coureurs.
 */
export function OgSummaryPanel({
  eyebrow,
  period,
  totalDistance,
  totalRuns,
  runners,
}: {
  eyebrow: string
  period: string
  totalDistance: number
  totalRuns: number
  runners: number
}) {
  const stats = [
    { value: totalRuns, unit: totalRuns > 1 ? "courses" : "course" },
    { value: runners, unit: runners > 1 ? "coureurs" : "coureur" },
  ]
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: `${OG_SUMMARY_W}px`,
        height: "100%",
        padding: "44px",
        borderRight: `1px solid ${OG.border}`,
        backgroundImage: `linear-gradient(160deg, ${OG.brand}1a, ${OG.bg} 55%)`,
      }}
    >
      <span
        style={{
          color: OG.brand,
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "3px",
        }}
      >
        {eyebrow}
      </span>
      <span
        style={{
          marginTop: "10px",
          color: OG.text,
          fontSize: "30px",
          fontWeight: 700,
        }}
      >
        {period}
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            color: OG.brand,
            fontSize: "120px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-4px",
          }}
        >
          {(totalDistance / 1000).toFixed(1).replace(".", ",")}
        </span>
        <span style={{ color: OG.muted, fontSize: "34px", fontWeight: 600 }}>
          km
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "48px",
          marginTop: "28px",
          paddingTop: "24px",
          borderTop: `1px solid ${OG.border}`,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.unit}
            style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
          >
            <span style={{ color: OG.text, fontSize: "36px", fontWeight: 700 }}>
              {s.value}
            </span>
            <span style={{ color: OG.muted, fontSize: "20px" }}>{s.unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Pastille de rang : or, argent, bronze sur le podium, neutre ensuite. */
export function OgRank({ rank, size = 36 }: { rank: number; size?: number }) {
  const tone = OG_PODIUM[rank - 1]
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
        backgroundColor: tone ? `${tone}26` : OG.border,
        border: `2px solid ${tone ?? OG.border}`,
        color: tone ?? OG.muted,
        fontSize: `${Math.round(size * 0.45)}px`,
        fontWeight: 800,
      }}
    >
      {rank}
    </div>
  )
}

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
