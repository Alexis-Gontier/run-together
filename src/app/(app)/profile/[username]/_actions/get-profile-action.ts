"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action/action-client"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({ username: z.string() })

export const getProfileAction = actionClient
  .inputSchema(schema)
  .action(async ({ parsedInput: { username } }) => {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        name: true,
        username: true,
        displayUsername: true,
        image: true,
        createdAt: true,
      },
    })

    return { user }
  })
