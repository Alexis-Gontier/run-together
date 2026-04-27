"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { banUserSchema } from "@/lib/schemas/admin-schema"

export const banUserAction = adminActionClient
  .inputSchema(banUserSchema)
  .action(async ({ parsedInput: { userId, banReason } }) => {
    await auth.api.banUser({
      body: { userId, banReason },
      headers: await headers(),
    })
  })
