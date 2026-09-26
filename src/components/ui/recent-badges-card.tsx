import { BadgeMedal } from "@/components/ui/badge-medal"
import { PanelCard } from "@/components/ui/panel-card"
import { getUnlockedBadges } from "@/lib/badges/evaluate"
import { ROUTES } from "@/lib/constants/routes"

/** Derniers badges d'un coureur (panneau du profil). Lien vers le catalogue s'il s'agit de soi. */
export async function RecentBadgesCard({
  userId,
  isOwn,
}: {
  userId: string
  isOwn: boolean
}) {
  const badges = await getUnlockedBadges(userId, 6)
  if (badges.length === 0 && !isOwn) return null

  return (
    <PanelCard
      title="Badges"
      link={
        isOwn ? { href: ROUTES.BADGES, label: "Tous mes badges" } : undefined
      }
    >
      {badges.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          Aucun badge pour l&apos;instant : la première course en débloque déjà.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <li
              key={b.key}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <BadgeMedal icon={b.icon} category={b.category} size="sm" />
              <span className="line-clamp-2 text-[11px] leading-tight">
                {b.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  )
}
