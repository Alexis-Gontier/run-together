"use client"

import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { LoadingButton } from "@/components/ui/loading-button"
import { resendNotificationAction } from "../_actions/resend-notification-action"

export function ResendButton({ id }: { id: string }) {
  const { execute, isPending } = useAction(resendNotificationAction, {
    onSuccess: ({ data }) =>
      data?.result === "sent"
        ? toast.success("Notification renvoyée.")
        : toast.error("Nouvel échec de l'envoi."),
    onError: () => toast.error("Impossible de renvoyer."),
  })

  return (
    <LoadingButton
      size="sm"
      variant="ghost"
      onClick={() => execute({ id })}
      isLoading={isPending}
      className="cursor-pointer"
    >
      Renvoyer
    </LoadingButton>
  )
}
