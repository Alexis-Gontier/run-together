"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { notifyMemberJoined } from "@/lib/discord/events"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const completeOnboardingAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    await auth.api.updateUser({
      body: { onboardingCompleted: true },
      headers: await headers(),
    })
    // Dédoublonné par utilisateur : un onboarding refait ne réannonce personne.
    await notifyMemberJoined(user.id)
  },
)
