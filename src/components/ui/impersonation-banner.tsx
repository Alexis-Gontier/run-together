"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth/auth-client"
import { ADMIN_ROUTES } from "@/lib/constants/routes"
import { Button } from "@/components/shadcn-ui/button"

export function ImpersonationBanner({ username }: { username: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function stop() {
    setIsPending(true)
    await authClient.admin.stopImpersonating()
    router.push(ADMIN_ROUTES.USERS)
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
      <span>
        Vous impersonifiez <strong>@{username}</strong>
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={stop}
        className="h-7 cursor-pointer border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
      >
        {isPending ? "Arrêt…" : "Arrêter l'impersonification"}
      </Button>
    </div>
  )
}
