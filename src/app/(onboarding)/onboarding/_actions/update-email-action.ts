"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { onboardingEmailSchema } from "@/lib/schemas/auth-schema"

export const updateEmailAction = authActionClient
  .inputSchema(onboardingEmailSchema)
  .action(async ({ parsedInput: { email }, ctx: { user } }) => {
    await prisma.user.update({
      where: { id: user.id },
      data: { email },
    })
  })
