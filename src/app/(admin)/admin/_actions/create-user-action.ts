"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { createUserSchema } from "@/lib/schemas/admin-schema"

export const createUserAction = adminActionClient
  .inputSchema(createUserSchema)
  .action(
    async ({ parsedInput: { username, name, email, password, role } }) => {
      await auth.api.createUser({
        body: {
          email,
          password,
          name,
          role,
          data: { username, displayUsername: username },
        },
        headers: await headers(),
      })
    },
  )
