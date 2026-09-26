import { PROFILE_IMAGE_TYPES } from "./config"

export type CropArea = { x: number; y: number; width: number; height: number }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Image illisible"))
    img.src = src
  })
}

/**
 * Découpe `area` (pixels de l'image source, fournis par react-easy-crop) et la redimensionne
 * en `width` × `height`. Navigateur uniquement. Renvoie une data URL WebP, ou JPEG si le
 * navigateur n'encode pas le WebP.
 */
export async function cropImage(
  src: string,
  area: CropArea,
  width: number,
  height: number,
): Promise<string> {
  const img = await loadImage(src)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas indisponible")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height,
  )

  for (const type of PROFILE_IMAGE_TYPES) {
    const url = canvas.toDataURL(type, 0.85)
    // Type non pris en charge : le navigateur renvoie du PNG, on essaie le suivant.
    if (url.startsWith(`data:${type}`)) return url
  }
  throw new Error("Format d'image non pris en charge par ce navigateur")
}
