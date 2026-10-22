import sharp from "sharp"

/**
 * Avatar ou bannière (WebP dans le Blob) en data URL **PNG** : Satori ne lit pas le WebP.
 * Réduite à `width` px pour garder l'OG léger. `null` si absente ou en échec : l'image
 * retombe sur l'initiale / le fond uni.
 */
export async function fetchImage(
  url: string | null,
  width: number,
  timeoutMs = 4000,
): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) throw new Error(`image ${res.status}`)
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width, withoutEnlargement: true })
      .png()
      .toBuffer()
    return `data:image/png;base64,${png.toString("base64")}`
  } catch (err) {
    console.error("[og] image failed", url, err)
    return null
  }
}

/**
 * Télécharge les tuiles en data URLs (Satori ne gère pas bien les échecs réseau).
 * `null` si l'une échoue : l'image retombe alors sur le tracé seul.
 */
export async function fetchTiles(
  urls: string[],
  timeoutMs = 4000,
): Promise<string[] | null> {
  try {
    return await Promise.all(
      urls.map(async (url) => {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(timeoutMs),
          next: { revalidate: 60 * 60 * 24 * 30 },
        })
        if (!res.ok) throw new Error(`tile ${res.status}`)
        const type = res.headers.get("content-type") ?? "image/jpeg"
        const data = Buffer.from(await res.arrayBuffer()).toString("base64")
        return `data:${type};base64,${data}`
      }),
    )
  } catch (err) {
    console.error("[og] map tiles failed", err)
    return null
  }
}
