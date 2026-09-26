export const BRAND_COLOR = 0x10b981
export const RECORD_COLOR = 0xf59e0b
export const FOOTER = { text: "Run Together" }

/** Distance en mètres → « 10,50 » (virgule : ces textes sont lus en français). */
export function km(meters: number): string {
  return (meters / 1000).toFixed(2).replace(".", ",")
}
