"use server"

import { prisma } from "@/lib/db/prisma"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { revokeSessionsSchema } from "@/lib/schemas/admin-schema"

export const revokeSessionsAction = adminActionClient
  .inputSchema(revokeSessionsSchema)
  .action(async ({ parsedInput: { userId } }) => {
    await prisma.session.deleteMany({ where: { userId } })
  })
