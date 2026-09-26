import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Progress } from "@/components/shadcn-ui/progress"
import { BadgeMedal } from "@/components/ui/badge-medal"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { BADGE_CATEGORIES } from "@/lib/badges/catalog"
import { type BadgeStatus, getBadgeStatuses } from "@/lib/badges/evaluate"
import { cn } from "@/lib/utils/cn"

const fmt = (v: number) =>
  (Math.round(v * 10) / 10).toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  })

function BadgeTile({ badge }: { badge: BadgeStatus }) {
  const locked = !badge.unlockedAt
  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border p-3",
        locked && "border-dashed",
      )}
    >
      <BadgeMedal icon={badge.icon} category={badge.category} locked={locked} />
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={cn(
            "font-semibold text-sm leading-tight",
            locked && "text-muted-foreground",
          )}
        >
          {badge.name}
        </p>
        <p className="text-muted-foreground text-xs">{badge.description}</p>
        {badge.unlockedAt ? (
          <p className="text-emerald-500 text-xs">
            Débloqué le{" "}
            {format(badge.unlockedAt, "d MMMM yyyy", { locale: fr })}
          </p>
        ) : (
          <div className="space-y-1 pt-0.5">
            <Progress value={badge.progress * 100} className="h-1.5" />
            <p className="text-muted-foreground text-xs tabular-nums">
              {fmt(badge.current)} / {fmt(badge.target)} {badge.unit}
            </p>
          </div>
        )}
      </div>
    </li>
  )
}

export default async function BadgesPage() {
  const user = await getRequiredUser()
  const badges = await getBadgeStatuses(user.id)
  const unlocked = badges.filter((b) => b.unlockedAt).length

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{unlocked}</span>
          <span className="text-muted-foreground">
            {" "}
            / {badges.length} badges débloqués
          </span>
        </p>
        <Progress value={(unlocked / badges.length) * 100} className="h-2" />
      </div>

      {BADGE_CATEGORIES.map((category) => {
        const items = badges.filter((b) => b.category === category.key)
        return (
          <section key={category.key} className="space-y-3">
            <h2 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {category.label}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((badge) => (
                <BadgeTile key={badge.key} badge={badge} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
