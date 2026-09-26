import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

/** Bloc des panneaux droits : même cadre que « Top du mois », titre + lien optionnel. */
export function PanelCard({
  title,
  aside,
  link,
  className,
  children,
}: {
  title: string
  aside?: React.ReactNode
  link?: { href: string; label: string }
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn("rounded-xl border bg-background p-4 shadow-sm", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-sm">{title}</h2>
        {aside && (
          <span className="text-muted-foreground text-xs">{aside}</span>
        )}
      </div>
      {children}
      {link && (
        <div className="mt-3 border-t pt-3">
          <Link
            href={link.href}
            className="flex items-center gap-1 font-medium text-primary text-xs hover:underline"
          >
            {link.label}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </section>
  )
}

/** Petite statistique : valeur en gras, libellé discret. */
export function PanelStat({
  value,
  label,
}: {
  value: React.ReactNode
  label: string
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-lg tabular-nums leading-tight">
        {value}
      </p>
      <p className="truncate text-muted-foreground text-xs">{label}</p>
    </div>
  )
}
