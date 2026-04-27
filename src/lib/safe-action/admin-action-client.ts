import { getUser } from "@/lib/auth/auth-session"
import { actionClient } from "@/lib/safe-action/action-client"

export const adminActionClient = actionClient.use(async ({ next }) => {
  const user = await getUser()
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden")
  }
  return next({ ctx: { user } })
})
