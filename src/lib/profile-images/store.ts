import { del, put } from "@vercel/blob"
import { env } from "@/env"
import {
  PROFILE_IMAGE_KINDS,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
  type ProfileImageKind,
} from "./config"

export const profileImagesEnabled = () => !!env.BLOB_READ_WRITE_TOKEN

/** Erreur attendue (fichier invalide) : message FR montré tel quel. */
export class ProfileImageError extends Error {}

/** Data URL WebP/JPEG (recadrée côté navigateur) → Vercel Blob. Renvoie l'URL publique. */
export async function storeProfileImage(
  userId: string,
  kind: ProfileImageKind,
  dataUrl: string,
): Promise<string> {
  const type = PROFILE_IMAGE_TYPES.find((t) =>
    dataUrl.startsWith(`data:${t};base64,`),
  )
  if (!type) throw new ProfileImageError("Format d'image non pris en charge.")
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64")
  if (bytes.length === 0 || bytes.length > PROFILE_IMAGE_MAX_BYTES)
    throw new ProfileImageError("Image trop lourde (2 Mo maximum).")

  const { url } = await put(
    `${PROFILE_IMAGE_KINDS[kind].folder}/${userId}.${type.split("/")[1]}`,
    bytes,
    {
      access: "public",
      contentType: type,
      // Suffixe aléatoire : nouvelle URL à chaque envoi, donc pas de cache CDN périmé.
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
      token: env.BLOB_READ_WRITE_TOKEN,
    },
  )
  return url
}

/** Supprime une ancienne image si elle vient de notre store ; ignore les URLs externes. */
export async function deleteProfileImage(url: string | null | undefined) {
  if (!url?.includes(".blob.vercel-storage.com/")) return
  try {
    await del(url, { token: env.BLOB_READ_WRITE_TOKEN })
  } catch (err) {
    console.error("[profile-images] delete failed", url, err)
  }
}
