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
