"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { deleteUserSchema } from "@/lib/schemas/admin-schema"

export const deleteUserAction = adminActionClient
  .inputSchema(deleteUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    })
  })
