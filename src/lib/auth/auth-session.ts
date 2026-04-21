import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"

export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    return null
  }
  return session.user
}

export async function getRequiredUser() {
  const user = await getUser()
  if (!user) {
    return unauthorized()
  }
  return user
}
