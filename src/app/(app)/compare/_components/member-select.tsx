"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"

export function MemberSelect({
  members,
  value,
}: {
  members: { username: string; name: string }[]
  value: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      value={value ?? undefined}
      onValueChange={(username) => {
        const params = new URLSearchParams(searchParams)
        params.set("with", username)
        startTransition(() => router.push(`${pathname}?${params}`))
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-full sm:w-64" aria-label="Membre à comparer">
        <SelectValue placeholder="Choisir un membre" />
      </SelectTrigger>
      <SelectContent>
        {members.map((m) => (
          <SelectItem key={m.username} value={m.username}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
