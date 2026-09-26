import type { BadgeStats } from "./stats"

export type BadgeCategory =
  | "distance"
  | "runs"
  | "elevation"
  | "single"
  | "streak"
  | "moments"
  | "records"

export type BadgeIcon =
  | "route"
  | "footprints"
  | "mountain"
  | "flag"
  | "calendar"
  | "sunrise"
  | "moon"
  | "party"
  | "trophy"
  | "crown"

export type BadgeDef = {
  key: string
  name: string
  description: string
  category: BadgeCategory
  icon: BadgeIcon
  emoji: string // pour Discord
  target: number
  unit: string
  value: (s: BadgeStats) => number
}

export const BADGE_CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: "distance", label: "Distance cumulée" },
  { key: "runs", label: "Nombre de courses" },
  { key: "elevation", label: "Dénivelé cumulé" },
  { key: "single", label: "Sur une course" },
  { key: "streak", label: "Régularité" },
  { key: "moments", label: "Moments" },
  { key: "records", label: "Records" },
]

// Même tolérance GPS que les records perso : un 4,9 km compte pour un 5 km.
const SINGLE_RUN_TOLERANCE = 0.97

const cumulative = (
  km: number,
): Pick<BadgeDef, "key" | "name" | "description"> => ({
  key: `distance-${km}`,
  name: `${km.toLocaleString("fr-FR")} km`,
  description: `Cumuler ${km.toLocaleString("fr-FR")} km de course.`,
})

const single = (
  key: string,
  name: string,
  km: number,
  description: string,
): BadgeDef => ({
  key,
  name,
  description,
  category: "single",
  icon: "flag",
  emoji: "🏁",
  target: km,
  unit: "km",
  // Au-delà de 97 % de la distance, le badge est acquis : on affiche alors la cible pleine.
  value: (s) =>
    s.longestRunKm >= km * SINGLE_RUN_TOLERANCE ? km : s.longestRunKm,
})

export const BADGES: BadgeDef[] = [
  ...[50, 100, 500, 1000].map(
    (km): BadgeDef => ({
      ...cumulative(km),
      category: "distance",
      icon: "route",
      emoji: "🛣️",
      target: km,
      unit: "km",
      value: (s) => s.totalKm,
    }),
  ),
  ...[10, 50, 100].map(
    (n): BadgeDef => ({
      key: `runs-${n}`,
      name: `${n} courses`,
      description: `Enregistrer ${n} courses.`,
      category: "runs",
      icon: "footprints",
      emoji: "👟",
      target: n,
      unit: "courses",
      value: (s) => s.totalRuns,
    }),
  ),
  ...[1000, 5000].map(
    (m): BadgeDef => ({
      key: `elevation-${m}`,
      name: `${m.toLocaleString("fr-FR")} m de D+`,
      description: `Cumuler ${m.toLocaleString("fr-FR")} m de dénivelé positif.`,
      category: "elevation",
      icon: "mountain",
      emoji: "⛰️",
      target: m,
      unit: "m",
      value: (s) => s.totalElevation,
    }),
  ),
  single("first-5k", "Premier 5 km", 5, "Courir 5 km d'une traite."),
  single("first-10k", "Premier 10 km", 10, "Courir 10 km d'une traite."),
  single("half-marathon", "Semi-marathon", 21.0975, "Boucler 21,1 km."),
  single("marathon", "Marathon", 42.195, "Boucler 42,2 km."),
  ...[4, 12, 52].map(
    (w): BadgeDef => ({
      key: `streak-${w}w`,
      name: w === 52 ? "Une année entière" : `${w} semaines d'affilée`,
      description: `Courir au moins une fois par semaine pendant ${w} semaines consécutives.`,
      category: "streak",
      icon: "calendar",
      emoji: "📅",
      target: w,
      unit: "semaines",
      value: (s) => s.maxConsecutiveWeeks,
    }),
  ),
  {
    key: "early-bird",
    name: "Lève-tôt",
    description: "Partir courir avant 7 h.",
    category: "moments",
    icon: "sunrise",
    emoji: "🌅",
    target: 1,
    unit: "fois",
    value: (s) => s.earlyRuns,
  },
  {
    key: "night-owl",
    name: "Noctambule",
    description: "Partir courir à 21 h ou plus tard.",
    category: "moments",
    icon: "moon",
    emoji: "🌙",
    target: 1,
    unit: "fois",
    value: (s) => s.lateRuns,
  },
  {
    key: "new-year",
    name: "Bonne année",
    description: "Courir un 1er janvier.",
    category: "moments",
    icon: "party",
    emoji: "🎉",
    target: 1,
    unit: "fois",
    value: (s) => s.newYearRuns,
  },
  {
    key: "first-record",
    name: "Premier record",
    description: "Établir un record personnel.",
    category: "records",
    icon: "trophy",
    emoji: "🏆",
    target: 1,
    unit: "record",
    value: (s) => s.recordDistances,
  },
  {
    key: "record-collector",
    name: "Collectionneur",
    description:
      "Détenir un record sur 4 distances (1 km, 5 km, 10 km, semi, marathon).",
    category: "records",
    icon: "crown",
    emoji: "👑",
    target: 4,
    unit: "distances",
    value: (s) => s.recordDistances,
  },
]

export const BADGES_BY_KEY = new Map(BADGES.map((b) => [b.key, b]))

/** Badges accordés par les statistiques. */
export function earnedBadges(stats: BadgeStats): BadgeDef[] {
  return BADGES.filter((b) => b.value(stats) >= b.target)
}

/** Avancement vers un badge, entre 0 et 1. */
export function badgeProgress(badge: BadgeDef, stats: BadgeStats): number {
  return Math.min(1, badge.value(stats) / badge.target)
}
