import { parseFit } from "./parse-fit"
import { parseGpx } from "./parse-gpx"
import { summarizeTrack } from "./summarize-track"
import { TrackParseError, type TrackSummary } from "./types"

/** Point d'entrée : fichier .gpx ou .fit → résumé prêt à pré-remplir le formulaire. */
export function parseTrackFile(
  fileName: string,
  bytes: Uint8Array,
): TrackSummary {
  const ext = fileName.toLowerCase().split(".").pop()
  if (ext === "gpx")
    return summarizeTrack(parseGpx(new TextDecoder().decode(bytes)))
  if (ext === "fit") return summarizeTrack(parseFit(bytes))
  throw new TrackParseError(
    "Format non pris en charge : utilise un fichier .gpx ou .fit.",
  )
}
