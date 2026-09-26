"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ROUTES } from "@/lib/constants/routes"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { weeklyGoalSchema } from "../_schemas/weekly-goal-schema"

export const updateWeeklyGoalAction = authActionClient
  .inputSchema(weeklyGoalSchema)
  .action(async ({ parsedInput: { weeklyGoalKm } }) => {
    await auth.api.updateUser({
      body: { weeklyGoalKm },
      headers: await headers(),
    })
    revalidatePath(ROUTES.SETTINGS)
  })
