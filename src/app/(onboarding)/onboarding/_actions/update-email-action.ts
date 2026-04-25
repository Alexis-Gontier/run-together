"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { onboardingEmailSchema } from "@/lib/schemas/auth-schema"

export const updateEmailAction = authActionClient
  .inputSchema(onboardingEmailSchema)
  .action(async ({ parsedInput: { email } }) => {
    await auth.api.updateUser({
      body: { email },
      headers: await headers(),
    })
  })
