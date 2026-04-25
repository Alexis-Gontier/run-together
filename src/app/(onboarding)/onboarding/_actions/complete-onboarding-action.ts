"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const completeOnboardingAction = authActionClient.action(async () => {
  await auth.api.updateUser({
    body: { onboardingCompleted: true },
    headers: await headers(),
  })
})
