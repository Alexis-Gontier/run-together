"use client"

import { Send, Trophy } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { Card, CardContent } from "@/components/shadcn-ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import type { StatsPeriod } from "@/lib/stats/periods"
import { cn } from "@/lib/utils/cn"
import { getInitials } from "@/lib/utils/get-initials"
import { publishBattleAction } from "../_actions/publish-battle-action"
import type { Side } from "../_utils/battle"

type Fighter = {
  name: string
  image: string | null
  /** « Toi » pour l'utilisateur connecté, sinon son nom. */
  label: string
  isMe: boolean
}

/** En-tête de la bataille : les deux coureurs, le score (1 point par ligne gagnée), Discord. */
export function BattleScoreboard({
  fighters,
  publishWith,
  period,
  score,
  winner,
}: {
  fighters: Record<Side, Fighter>
  /** Adversaire à passer à l'action Discord ; `null` = duel entre deux autres membres. */
  publishWith: string | null
  period: StatsPeriod
  score: Record<Side, number>
  winner: Side | null
}) {
  const publish = useAction(publishBattleAction, {
    onSuccess: ({ data }) => {
      if (data?.error) toast.error(data.error)
      else toast.success("Résultat publié sur Discord")
    },
    onError: () => toast.error("Publication impossible, réessaie."),
  })

  const fighter = (f: Fighter, side: Side) => (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        side === "me" ? "flex-row-reverse text-right" : "",
      )}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={f.image ?? undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(f.name)}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          side === "me" ? "items-end" : "items-start",
        )}
      >
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-1 font-semibold text-sm",
            winner === side ? "text-amber-500" : "text-muted-foreground",
          )}
        >
          {winner === side && <Trophy className="size-4 shrink-0" />}
          <span className="truncate">{f.label}</span>
        </span>
        <span
          className={cn(
            "font-black text-4xl tabular-nums",
            winner !== side && "text-muted-foreground",
          )}
        >
          {score[side]}
        </span>
      </div>
    </div>
  )

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {fighter(fighters.me, "me")}
          <span className="text-muted-foreground text-xs uppercase">vs</span>
          {fighter(fighters.other, "other")}
        </div>
        <div className="space-y-0.5 text-center">
          <p className="font-medium text-sm">
            {winner === null
              ? "Match nul."
              : fighters[winner].isMe
                ? "Tu remportes la bataille !"
                : `${fighters[winner].name} remporte la bataille.`}
          </p>
          <p className="text-muted-foreground text-xs">
            1 point par ligne gagnée, records compris.
          </p>
        </div>
        {publishWith && (
          <div className="flex justify-center">
            <LoadingButton
              variant="outline"
              size="sm"
              isLoading={publish.isPending}
              onClick={() => publish.execute({ with: publishWith, period })}
            >
              <Send />
              Publier le résultat sur Discord
            </LoadingButton>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
