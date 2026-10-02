"use client"

import { Send, Trophy } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/shadcn-ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { cn } from "@/lib/utils/cn"
import { publishBattleAction } from "../_actions/publish-battle-action"
import type { Side } from "../_utils/battle"
import type { ComparePeriod } from "../_utils/comparison"

/** Score de la bataille (1 point par ligne gagnée) + publication sur Discord. */
export function BattleScoreboard({
  otherName,
  otherUsername,
  period,
  score,
  winner,
}: {
  otherName: string
  otherUsername: string
  period: ComparePeriod
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

  const fighter = (name: string, side: Side) => (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        side === "me" ? "items-end text-right" : "items-start",
      )}
    >
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1 truncate font-semibold text-sm",
          winner === side ? "text-amber-500" : "text-muted-foreground",
        )}
      >
        {winner === side && <Trophy className="size-4 shrink-0" />}
        <span className="truncate">{name}</span>
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
  )

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {fighter("Toi", "me")}
          <span className="text-muted-foreground text-xs uppercase">vs</span>
          {fighter(otherName, "other")}
        </div>
        <div className="space-y-0.5 text-center">
          <p className="font-medium text-sm">
            {winner === null
              ? "Match nul."
              : winner === "me"
                ? "Tu remportes la bataille !"
                : `${otherName} remporte la bataille.`}
          </p>
          <p className="text-muted-foreground text-xs">
            1 point par ligne gagnée, records compris.
          </p>
        </div>
        <div className="flex justify-center">
          <LoadingButton
            variant="outline"
            size="sm"
            isLoading={publish.isPending}
            onClick={() => publish.execute({ with: otherUsername, period })}
          >
            <Send />
            Publier le résultat sur Discord
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}
