import { headers } from "next/headers"
import { forbidden, unauthorized } from "next/navigation"
import { auth } from "@/lib/auth"

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getUser() {
  const session = await getSession()
  if (!session?.user) return null
  return session.user
}

export async function getRequiredUser() {
  const user = await getUser()
  if (!user) return unauthorized()
  return user
}

export async function getRequiredAdmin() {
  const user = await getUser()
  if (!user) return unauthorized()
  if (user.role !== "admin") return forbidden()
  return user
}
