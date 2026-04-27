"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { impersonateUserSchema } from "@/lib/schemas/admin-schema"

export const impersonateUserAction = adminActionClient
  .inputSchema(impersonateUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    await auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    })
  })
