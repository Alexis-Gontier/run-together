"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action/action-client"
import { ROUTES } from "@/lib/constants/routes"
import { signUpSchema } from "@/lib/schemas/auth-schema"

export const registerAction = actionClient
  .inputSchema(signUpSchema)
  .action(async ({ parsedInput: { name, username, email, password } }) => {
    await auth.api.signUpEmail({
      body: {
        name,
        username,
        email,
        password,
      },
      headers: await headers(),
    })

    redirect(ROUTES.HOME)
  })
