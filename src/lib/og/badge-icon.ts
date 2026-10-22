import { type IconNode, icons } from "lucide"
import { BADGE_ICONS } from "@/components/ui/badge-medal"
import type { BadgeIcon } from "@/lib/badges/catalog"

/**
 * Tracé de l'icône d'un badge, la même que `BadgeMedal`. Satori ne peut pas exécuter les
 * composants lucide-react (ils lisent un contexte React) : on passe par les données du
 * paquet `lucide`, indexées par le même nom que le composant (`Route`, `Map`…).
 */
export function badgeIconNode(icon: BadgeIcon): IconNode | null {
  const name = BADGE_ICONS[icon].displayName as keyof typeof icons
  return icons[name] ?? null
}

/** Icône d'un badge en data URL SVG, pour un `<img>` Satori. */
export function badgeIconSrc(
  icon: BadgeIcon,
  color: string,
  size: number,
): string | null {
  const node = badgeIconNode(icon)
  if (!node) return null
  const children = node
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ")}/>`,
    )
    .join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
