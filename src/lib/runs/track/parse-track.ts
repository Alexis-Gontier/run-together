import { gunzipSync } from "node:zlib"
import { parseFit } from "./parse-fit"
import { parseGpx } from "./parse-gpx"
import { parseTcx } from "./parse-tcx"
import { summarizeTrack } from "./summarize-track"
import { TrackParseError, type TrackSummary } from "./types"

const MAX_UNZIPPED = 100 * 1024 * 1024

/**
 * Point d'entrée : fichier .gpx, .tcx ou .fit → résumé prêt à pré-remplir le formulaire.
 * Accepte aussi leur version compressée (`.fit.gz`…), telle que l'archive Strava la fournit.
 */
export function parseTrackFile(
  fileName: string,
  bytes: Uint8Array,
): TrackSummary {
  let name = fileName.toLowerCase()
  if (name.endsWith(".gz")) {
    try {
      // Plafond : un .gz de 15 Mo pourrait sinon se décompresser en plusieurs Go.
      bytes = new Uint8Array(
        gunzipSync(bytes, { maxOutputLength: MAX_UNZIPPED }),
      )
    } catch {
      throw new TrackParseError("Archive .gz illisible ou trop volumineuse.")
    }
    name = name.slice(0, -3)
  }
  const ext = name.split(".").pop()
  if (ext === "gpx")
    return summarizeTrack(parseGpx(new TextDecoder().decode(bytes)))
  if (ext === "tcx")
    return summarizeTrack(parseTcx(new TextDecoder().decode(bytes)))
  if (ext === "fit") return summarizeTrack(parseFit(bytes))
  throw new TrackParseError(
    "Format non pris en charge : utilise un fichier .gpx, .tcx ou .fit.",
  )
}
