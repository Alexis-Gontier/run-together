"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import {
  PROFILE_IMAGE_KINDS,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileImageKind,
} from "@/lib/profile-images/config"
import {
  deleteProfileImage,
  ProfileImageError,
  profileImagesEnabled,
  storeProfileImage,
} from "@/lib/profile-images/store"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

const kindSchema = z.enum(
  Object.keys(PROFILE_IMAGE_KINDS) as [ProfileImageKind, ...ProfileImageKind[]],
)

// Champ `User` modifié pour chaque type d'image.
const FIELD = { avatar: "image", banner: "bannerImage" } as const

async function setImage(
  userId: string,
  kind: ProfileImageKind,
  url: string | null,
) {
  // Lu en base : la session en cache peut avoir quelques minutes de retard.
  const current = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { image: true, bannerImage: true },
  })
  const previous = current[FIELD[kind]]
  // Via better-auth (et non Prisma) : le cache de session est rafraîchi, l'en-tête suit.
  await auth.api.updateUser({
    body: { [FIELD[kind]]: url },
    headers: await headers(),
  })
  await deleteProfileImage(previous)
  // L'avatar apparaît partout (fil, classement, profils…) : tout le layout de l'app.
  revalidatePath("/", "layout")
}

export const uploadProfileImageAction = authActionClient
  .inputSchema(
    z.object({
      kind: kindSchema,
      // Data URL base64 : ~4/3 de la taille binaire.
      dataUrl: z
        .string()
        .max(Math.ceil((PROFILE_IMAGE_MAX_BYTES * 4) / 3) + 64),
    }),
  )
  .action(async ({ parsedInput: { kind, dataUrl }, ctx: { user } }) => {
    if (!profileImagesEnabled())
      return { error: "L'envoi d'images n'est pas configuré." }
    try {
      const url = await storeProfileImage(user.id, kind, dataUrl)
      await setImage(user.id, kind, url)
      return { url }
    } catch (err) {
      if (err instanceof ProfileImageError) return { error: err.message }
      throw err
    }
  })

export const removeProfileImageAction = authActionClient
  .inputSchema(z.object({ kind: kindSchema }))
  .action(async ({ parsedInput: { kind }, ctx: { user } }) => {
    await setImage(user.id, kind, null)
    return { ok: true }
  })
