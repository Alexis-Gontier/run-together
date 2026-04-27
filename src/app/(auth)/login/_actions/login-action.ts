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

    try {
      await auth.api.signInUsername({
        body: { username, password },
        headers: reqHeaders,
      })
    } catch (error) {
      const e = error as { statusCode?: number; body?: { code?: string } }
      if (e.statusCode === 429) {
        return { error: "Trop de tentatives. Réessaie dans 60 secondes." }
      }
      if (e.statusCode === 403 || e.body?.code === "BANNED_USER") {
        return { error: "Ton compte a été suspendu." }
      }
      return { error: "Identifiants incorrects." }
    }

    const referer = reqHeaders.get("referer")
    const callbackUrl = referer
      ? new URL(referer).searchParams.get("callbackUrl")
      : null

    redirect(callbackUrl ?? ROUTES.HOME)
  })
