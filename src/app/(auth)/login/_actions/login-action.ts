"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action/action-client"
import { ROUTES } from "@/lib/constants/routes"
import { signInSchema } from "@/lib/schemas/auth-schema"

export const loginAction = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput: { username, password } }) => {
    const reqHeaders = await headers()

    await auth.api.signInUsername({
      body: { username, password },
      headers: reqHeaders,
    })

    const referer = reqHeaders.get("referer")
    const callbackUrl = referer
      ? new URL(referer).searchParams.get("callbackUrl")
      : null

    redirect(callbackUrl ?? ROUTES.HOME)
  })
