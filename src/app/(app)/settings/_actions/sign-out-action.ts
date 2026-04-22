"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AUTH_ROUTES } from "@/lib/constants/routes"

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  })
  redirect(AUTH_ROUTES.LOGIN)
}
