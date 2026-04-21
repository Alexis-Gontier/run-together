import { getRequiredUser } from "@/lib/auth/auth-session"
import { actionClient } from "@/lib/safe-action/action-client"

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getRequiredUser()
  return next({
    ctx: { user },
  })
})
