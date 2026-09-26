"use client"

import { Send } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { LoadingButton } from "@/components/ui/loading-button"
import { testWebhookAction } from "../_actions/test-webhook-action"

export function TestWebhookButton() {
  const { execute, isPending } = useAction(testWebhookAction, {
    onSuccess: ({ data }) =>
      data?.result === "sent"
        ? toast.success("Message de test envoyé sur Discord.")
        : toast.error("Échec de l'envoi — voir le journal ci-dessous."),
    onError: () => toast.error("Impossible d'envoyer le test."),
  })

  return (
    <LoadingButton
      onClick={() => execute()}
      isLoading={isPending}
      variant="outline"
      className="cursor-pointer"
    >
      <Send className="size-4" />
      Tester le webhook
    </LoadingButton>
  )
}
