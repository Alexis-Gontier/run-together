"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const updateDiscordPreferenceAction = authActionClient
  .inputSchema(z.object({ publishRunsToDiscord: z.boolean() }))
  .action(async ({ parsedInput: { publishRunsToDiscord } }) => {
    await auth.api.updateUser({
      body: { publishRunsToDiscord },
      headers: await headers(),
    })
  })
