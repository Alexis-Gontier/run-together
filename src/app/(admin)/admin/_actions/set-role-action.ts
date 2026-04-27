"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { setRoleSchema } from "@/lib/schemas/admin-schema"

export const setRoleAction = adminActionClient
  .inputSchema(setRoleSchema)
  .action(async ({ parsedInput: { userId, role } }) => {
    await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    })
  })
