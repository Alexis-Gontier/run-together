"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { onboardingDisplayNameSchema } from "@/lib/schemas/auth-schema"

export const updateDisplayNameAction = authActionClient
  .inputSchema(onboardingDisplayNameSchema)
  .action(async ({ parsedInput: { name } }) => {
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    })
  })
