import { defaultRunName } from "../pace"
import type { RecordRunInput } from "../schemas"
import type { TrackSummary } from "./types"

/**
 * Résumé de fichier → entrée de `recordRun`, sans passer par le formulaire (import en masse).
 * Le nom par défaut suit l'heure de Paris : ce code tourne sur le serveur.
 */
export function trackSummaryToRunInput(s: TrackSummary): RecordRunInput {
  return {
    name: s.name || defaultRunName(s.date, "Europe/Paris"),
    sportType: s.sportType,
    distance: Math.round(s.distance),
    duration: Math.round(s.duration),
    elevation: Math.round(s.elevation),
    date: s.date,
    heartRateAvg: s.heartRateAvg,
    heartRateMax: s.heartRateMax,
    cadenceAvg: s.cadenceAvg,
    calories: s.calories,
    ...s.track,
  }
}
