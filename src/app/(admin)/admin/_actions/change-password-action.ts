"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { changePasswordSchema } from "@/lib/schemas/admin-schema"

export const changePasswordAction = adminActionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput: { userId, newPassword } }) => {
    await auth.api.setUserPassword({
      body: { userId, newPassword },
      headers: await headers(),
    })
  })
