"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/shadcn-ui/switch"
import { updateDiscordPreferenceAction } from "../_actions/update-discord-preference-action"

export function DiscordPreferenceSwitch({
  defaultChecked,
}: {
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  const { execute, isPending } = useAction(updateDiscordPreferenceAction, {
    onSuccess: ({ input }) =>
      toast.success(
        input.publishRunsToDiscord
          ? "Tes courses seront publiées sur Discord."
          : "Tes courses ne seront plus publiées sur Discord.",
      ),
    onError: ({ input }) => {
      setChecked(!input.publishRunsToDiscord)
      toast.error("Impossible d'enregistrer la préférence.")
    },
  })

  return (
    <Switch
      className="cursor-pointer"
      aria-label="Publier mes courses sur Discord"
      checked={checked}
      disabled={isPending}
      onCheckedChange={(value) => {
        setChecked(value)
        execute({ publishRunsToDiscord: value })
      }}
    />
  )
}
