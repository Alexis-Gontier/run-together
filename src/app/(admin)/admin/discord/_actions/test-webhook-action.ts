"use server"

import { revalidatePath } from "next/cache"
import { ADMIN_ROUTES } from "@/lib/constants/routes"
import { sendTestNotification } from "@/lib/discord/events"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"

export const testWebhookAction = adminActionClient.action(async () => {
  const result = await sendTestNotification()
  revalidatePath(ADMIN_ROUTES.DISCORD)
  return { result }
})
