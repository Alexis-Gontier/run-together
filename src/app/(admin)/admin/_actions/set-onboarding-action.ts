"use server"

import { prisma } from "@/lib/db/prisma"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { setOnboardingSchema } from "@/lib/schemas/admin-schema"

export const setOnboardingAction = adminActionClient
  .inputSchema(setOnboardingSchema)
  .action(async ({ parsedInput: { userId, completed } }) => {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: completed },
    })
  })
