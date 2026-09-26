"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shadcn-ui/toggle-group"

/** Sélecteur de période dans l'URL (`?period=`), en conservant les autres paramètres. */
export function PeriodToggle<T extends string>({
  value,
  options,
}: {
  value: T
  options: { value: T; label: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => {
        if (!next) return
        const params = new URLSearchParams(searchParams)
        params.set("period", next)
        startTransition(() => router.push(`${pathname}?${params}`))
      }}
      aria-label="Période"
      className={isPending ? "flex-wrap opacity-60" : "flex-wrap"}
    >
      {options.map((p) => (
        <ToggleGroupItem
          key={p.value}
          value={p.value}
          className="cursor-pointer px-3"
        >
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
