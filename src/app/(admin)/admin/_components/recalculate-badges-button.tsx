"use client"

import { Medal } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { LoadingButton } from "@/components/ui/loading-button"
import { recalculateBadgesAction } from "../_actions/recalculate-badges-action"

export function RecalculateBadgesButton() {
  const { execute, isPending } = useAction(recalculateBadgesAction, {
    onSuccess: ({ data }) =>
      toast.success(
        `Badges recalculés pour ${data?.users ?? 0} membres : ${data?.unlocked ?? 0} nouveaux.`,
      ),
    onError: () => toast.error("Impossible de recalculer les badges."),
  })

  return (
    <LoadingButton
      variant="outline"
      onClick={() => execute()}
      isLoading={isPending}
      className="cursor-pointer"
    >
      <Medal className="size-4" />
      Recalculer les badges
    </LoadingButton>
  )
}
