"use client"

import { ArrowLeftRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/shadcn-ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"

type Member = { username: string; name: string; isMe: boolean }

/**
 * Les deux coureurs du duel, alignés sur les colonnes « gauche | vs | droite » des cartes.
 * Gauche = `?a=` (toi par défaut, paramètre absent), droite = `?with=`.
 */
export function DuelPicker({
  members,
  left,
  right,
}: {
  members: Member[]
  left: string
  right: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const me = members.find((m) => m.isMe)?.username

  const go = (nextLeft: string, nextRight: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (nextLeft === me) params.delete("a")
    else params.set("a", nextLeft)
    if (nextRight) params.set("with", nextRight)
    else params.delete("with")
    startTransition(() => router.push(`${pathname}?${params}`))
  }

  const select = (
    value: string | null,
    exclude: string | null,
    onChange: (username: string) => void,
    label: string,
  ) => (
    <Select
      value={value ?? undefined}
      onValueChange={onChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-full min-w-0" aria-label={label}>
        <SelectValue placeholder="Choisir un membre" />
      </SelectTrigger>
      <SelectContent>
        {members
          .filter((m) => m.username !== exclude)
          .map((m) => (
            <SelectItem key={m.username} value={m.username}>
              {m.isMe ? `${m.name} (toi)` : m.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {select(left, right, (u) => go(u, right), "Premier coureur")}
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer"
        aria-label="Échanger les coureurs"
        disabled={!right || isPending}
        onClick={() => right && go(right, left)}
      >
        <ArrowLeftRight />
      </Button>
      {select(right, left, (u) => go(left, u), "Second coureur")}
    </div>
  )
}
