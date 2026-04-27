"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { unbanUserSchema } from "@/lib/schemas/admin-schema"

export const unbanUserAction = adminActionClient
  .inputSchema(unbanUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    })
  })
