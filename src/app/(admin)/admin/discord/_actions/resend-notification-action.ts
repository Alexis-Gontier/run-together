"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ADMIN_ROUTES } from "@/lib/constants/routes"
import { resendNotification } from "@/lib/discord/notify"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"

export const resendNotificationAction = adminActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const result = await resendNotification(id)
    revalidatePath(ADMIN_ROUTES.DISCORD)
    return { result }
  })
