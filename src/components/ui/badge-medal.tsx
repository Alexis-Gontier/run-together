import {
  CalendarCheck,
  Crown,
  Flag,
  Footprints,
  type LucideIcon,
  Moon,
  Mountain,
  PartyPopper,
  Route,
  Sunrise,
  Trophy,
} from "lucide-react"
import type { BadgeCategory, BadgeIcon } from "@/lib/badges/catalog"
import { cn } from "@/lib/utils/cn"

const ICONS: Record<BadgeIcon, LucideIcon> = {
  route: Route,
  footprints: Footprints,
  mountain: Mountain,
  flag: Flag,
  calendar: CalendarCheck,
  sunrise: Sunrise,
  moon: Moon,
  party: PartyPopper,
  trophy: Trophy,
  crown: Crown,
}

// Une teinte par catégorie, pour reconnaître la famille d'un badge d'un coup d'œil.
const TONES: Record<BadgeCategory, string> = {
  distance: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/40",
  runs: "bg-sky-500/15 text-sky-500 ring-sky-500/40",
  elevation: "bg-orange-500/15 text-orange-500 ring-orange-500/40",
  single: "bg-violet-500/15 text-violet-500 ring-violet-500/40",
  streak: "bg-teal-500/15 text-teal-500 ring-teal-500/40",
  moments: "bg-pink-500/15 text-pink-500 ring-pink-500/40",
  records: "bg-amber-500/15 text-amber-500 ring-amber-500/40",
}

/** Médaille ronde d'un badge ; grisée tant qu'il n'est pas débloqué. */
export function BadgeMedal({
  icon,
  category,
  locked = false,
  size = "md",
}: {
  icon: BadgeIcon
  category: BadgeCategory
  locked?: boolean
  size?: "sm" | "md"
}) {
  const Icon = ICONS[icon]
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ring-1",
        size === "md" ? "size-12" : "size-9",
        locked
          ? "bg-muted text-muted-foreground/60 ring-border"
          : TONES[category],
      )}
    >
      <Icon className={size === "md" ? "size-5" : "size-4"} />
    </span>
  )
}
