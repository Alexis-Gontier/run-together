import type { BadgeStats } from "./stats"

export type BadgeCategory =
  | "distance"
  | "runs"
  | "elevation"
  | "single"
  | "streak"
  | "moments"
  | "records"
  | "fun"
  | "group"

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
  | "landmark"
  | "mountain-snow"
  | "car"
  | "map"
  | "hand"
  | "pi"
  | "moon-star"
  | "gift"
  | "church"
  | "snail"
  | "rocket"
  | "repeat"
  | "sparkles"
  | "timer"
  | "arrows"
  | "skull"
  | "fish"
  | "ghost"
  | "wine"
  | "clock"
  | "target"
  | "zap"
  | "flame"
  | "shield"
  | "users"
  | "globe"

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
  { key: "fun", label: "Pour rire" },
  { key: "group", label: "Ensemble" },
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

  // ── Repères concrets ──────────────────────────────────────────────────────
  {
    key: "eiffel-tower",
    name: "Tour Eiffel",
    description: "Cumuler 330 m de D+, la hauteur de la tour.",
    category: "elevation",
    icon: "landmark",
    emoji: "🗼",
    target: 330,
    unit: "m",
    value: (s) => s.totalElevation,
  },
  {
    key: "mont-blanc",
    name: "Mont Blanc",
    description: "Cumuler 4 806 m de D+ : le toit des Alpes.",
    category: "elevation",
    icon: "mountain-snow",
    emoji: "🏔️",
    target: 4806,
    unit: "m",
    value: (s) => s.totalElevation,
  },
  {
    key: "everest",
    name: "Everest",
    description: "Cumuler 8 849 m de D+ : le toit du monde.",
    category: "elevation",
    icon: "mountain-snow",
    emoji: "🧗",
    target: 8849,
    unit: "m",
    value: (s) => s.totalElevation,
  },
  {
    key: "peripherique",
    name: "Tour du périph'",
    description: "Cumuler 35 km, un tour du boulevard périphérique parisien.",
    category: "distance",
    icon: "car",
    emoji: "🚗",
    target: 35,
    unit: "km",
    value: (s) => s.totalKm,
  },
  {
    key: "paris-lyon",
    name: "Paris–Lyon",
    description: "Cumuler 465 km, la distance entre les deux villes.",
    category: "distance",
    icon: "map",
    emoji: "🗺️",
    target: 465,
    unit: "km",
    value: (s) => s.totalKm,
  },
  {
    key: "paris-marseille",
    name: "Paris–Marseille",
    description: "Cumuler 775 km : on arrive à la mer.",
    category: "distance",
    icon: "map",
    emoji: "🌊",
    target: 775,
    unit: "km",
    value: (s) => s.totalKm,
  },
  // ── Pour rire ─────────────────────────────────────────────────────────────
  {
    key: "six-seven",
    name: "Six Seven",
    description: "Courir 6,7 km pile, ou tenir 6'07\" au kilomètre. 🤷",
    category: "fun",
    icon: "hand",
    emoji: "🤷",
    target: 1,
    unit: "fois",
    value: (s) => s.sixSevenRuns,
  },
  {
    key: "pi",
    name: "π",
    description: "Courir 3,14 km. Ni plus, ni moins.",
    category: "fun",
    icon: "pi",
    emoji: "🥧",
    target: 1,
    unit: "fois",
    value: (s) => s.piRuns,
  },
  {
    key: "answer-42",
    name: "La réponse",
    description: "Enregistrer 42 courses. La réponse à la grande question.",
    category: "fun",
    icon: "sparkles",
    emoji: "🌌",
    target: 42,
    unit: "courses",
    value: (s) => s.totalRuns,
  },
  {
    key: "night-shift",
    name: "Nuit blanche",
    description: "Partir courir entre minuit et 4 h.",
    category: "fun",
    icon: "moon-star",
    emoji: "🦉",
    target: 1,
    unit: "fois",
    value: (s) => s.nightRuns,
  },
  {
    key: "christmas",
    name: "Joyeux Noël",
    description: "Courir un 25 décembre, avant ou après la bûche.",
    category: "fun",
    icon: "gift",
    emoji: "🎄",
    target: 1,
    unit: "fois",
    value: (s) => s.christmasRuns,
  },
  {
    key: "sunday-mass",
    name: "Messe du dimanche",
    description: "Courir 10 dimanches.",
    category: "fun",
    icon: "church",
    emoji: "⛪",
    target: 10,
    unit: "dimanches",
    value: (s) => s.sundayRuns,
  },
  {
    key: "double-dose",
    name: "Double dose",
    description: "Courir deux fois le même jour.",
    category: "fun",
    icon: "repeat",
    emoji: "🔁",
    target: 1,
    unit: "fois",
    value: (s) => s.doubleDays,
  },
  {
    key: "rocket",
    name: "Fusée",
    description: "Passer sous les 4'00\" au kilomètre sur 5 km ou plus.",
    category: "fun",
    icon: "rocket",
    emoji: "🚀",
    target: 1,
    unit: "fois",
    value: (s) => s.fastRuns,
  },
  {
    key: "snail",
    name: "Escargot",
    description:
      "Prendre son temps : plus de 8'00\" au kilomètre. Ça compte aussi.",
    category: "fun",
    icon: "snail",
    emoji: "🐌",
    target: 1,
    unit: "fois",
    value: (s) => s.slowRuns,
  },
  {
    key: "week-on-fire",
    name: "Semaine de feu",
    description: "Courir 50 km dans la même semaine.",
    category: "distance",
    icon: "flame",
    emoji: "🔥",
    target: 50,
    unit: "km",
    value: (s) => s.maxWeekKm,
  },
  {
    key: "centurion",
    name: "Centurion",
    description: "Courir 100 km dans le même mois.",
    category: "distance",
    icon: "shield",
    emoji: "🛡️",
    target: 100,
    unit: "km",
    value: (s) => s.maxMonthKm,
  },
  {
    key: "metronome",
    name: "Métronome",
    description:
      "Courir deux fois à la même allure, à la seconde près (3 km ou plus).",
    category: "fun",
    icon: "timer",
    emoji: "⏱️",
    target: 1,
    unit: "fois",
    value: (s) => s.samePaceRuns,
  },
  {
    key: "palindrome",
    name: "Palindrome",
    description: "Un chrono qui se lit dans les deux sens, comme 45:54.",
    category: "fun",
    icon: "arrows",
    emoji: "🔄",
    target: 1,
    unit: "fois",
    value: (s) => s.palindromeRuns,
  },
  {
    key: "friday-13",
    name: "Vendredi 13",
    description: "Courir un vendredi 13. Même pas peur.",
    category: "fun",
    icon: "skull",
    emoji: "💀",
    target: 1,
    unit: "fois",
    value: (s) => s.friday13Runs,
  },
  {
    key: "april-fool",
    name: "Poisson d'avril",
    description: "Courir un 1er avril. Ce n'est pas une blague.",
    category: "fun",
    icon: "fish",
    emoji: "🐟",
    target: 1,
    unit: "fois",
    value: (s) => s.aprilFoolRuns,
  },
  {
    key: "halloween",
    name: "Halloween",
    description: "Courir un 31 octobre.",
    category: "fun",
    icon: "ghost",
    emoji: "🎃",
    target: 1,
    unit: "fois",
    value: (s) => s.halloweenRuns,
  },
  {
    key: "new-year-eve",
    name: "Saint-Sylvestre",
    description: "Courir un 31 décembre, pour finir l'année en beauté.",
    category: "fun",
    icon: "wine",
    emoji: "🥂",
    target: 1,
    unit: "fois",
    value: (s) => s.newYearEveRuns,
  },
  {
    key: "on-the-hour",
    name: "Heure pile",
    description:
      "Partir à l'heure pile (7:00, 18:00…), montre à l'appui : course avec tracé GPS.",
    category: "fun",
    icon: "clock",
    emoji: "🕐",
    target: 1,
    unit: "fois",
    value: (s) => s.onTheHourRuns,
  },
  {
    key: "round-km",
    name: "Pile poil",
    description: "Une distance au kilomètre rond, à 10 m près (3 km ou plus).",
    category: "fun",
    icon: "target",
    emoji: "🎯",
    target: 1,
    unit: "fois",
    value: (s) => s.roundKmRuns,
  },
  {
    key: "record-storm",
    name: "Pluie de records",
    description: "Détenir 3 records grâce à une même course.",
    category: "records",
    icon: "zap",
    emoji: "⚡",
    target: 3,
    unit: "records",
    value: (s) => s.maxRecordsOnOneRun,
  },
  {
    key: "group-10000",
    name: "10 000 km ensemble",
    description:
      "Le groupe cumule 10 000 km. Badge pour tous ceux qui ont couru.",
    category: "group",
    icon: "users",
    emoji: "🤝",
    target: 10000,
    unit: "km",
    value: (s) => s.groupKm,
  },
  {
    key: "group-world",
    name: "Tour du monde",
    description: "Le groupe cumule 40 075 km, la circonférence de la Terre.",
    category: "group",
    icon: "globe",
    emoji: "🌍",
    target: 40075,
    unit: "km",
    value: (s) => s.groupKm,
  },
  {
    key: "group-himalaya",
    name: "Himalaya",
    description: "Le groupe cumule 88 490 m de D+ : dix fois l'Everest.",
    category: "group",
    icon: "mountain-snow",
    emoji: "🏔️",
    target: 88490,
    unit: "m",
    value: (s) => s.groupElevation,
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
