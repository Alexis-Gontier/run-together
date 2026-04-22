"use server"

import { headers } from "next/headers"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { auth } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/schemas/auth-schema"

export const changePasswordAction = authActionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput: { currentPassword, newPassword } }) => {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    })
  })
