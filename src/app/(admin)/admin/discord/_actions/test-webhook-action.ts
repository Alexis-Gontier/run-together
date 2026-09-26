"use server"

import { revalidatePath } from "next/cache"
import { ADMIN_ROUTES } from "@/lib/constants/routes"
import { sendTestNotification } from "@/lib/discord/events"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"

export const testWebhookAction = adminActionClient.action(
  async ({ ctx: { user } }) => {
    const result = await sendTestNotification(user.name)
    revalidatePath(ADMIN_ROUTES.DISCORD)
    return { result }
  },
)
