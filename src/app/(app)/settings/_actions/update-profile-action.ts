"use server"

import { APIError } from "better-auth/api"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ROUTES } from "@/lib/constants/routes"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { updateProfileSchema } from "../_schemas/update-profile-schema"

export const updateProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput: { name, username } }) => {
    try {
      await auth.api.updateUser({
        body: { name, username },
        headers: await headers(),
      })
    } catch (err) {
      // Le plugin username refuse un nom déjà pris : erreur attendue, pas une panne.
      if (err instanceof APIError)
        return { error: "Ce nom d'utilisateur est déjà pris ou invalide." }
      throw err
    }
    revalidatePath(ROUTES.SETTINGS)
    return { ok: true }
  })
