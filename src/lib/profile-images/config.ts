/** Images de profil : dimensions de sortie (recadrage navigateur) et dossier Blob. */
export const PROFILE_IMAGE_KINDS = {
  avatar: {
    width: 512,
    height: 512,
    folder: "avatars",
    label: "photo de profil",
  },
  banner: { width: 1500, height: 500, folder: "banners", label: "bannière" },
} as const

export type ProfileImageKind = keyof typeof PROFILE_IMAGE_KINDS

// Après recadrage et export WebP, une image fait ~50–300 Ko : 2 Mo laisse de la marge.
export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024
// WebP en priorité ; JPEG si le navigateur ne sait pas encoder le WebP (anciens Safari).
export const PROFILE_IMAGE_TYPES = ["image/webp", "image/jpeg"] as const
