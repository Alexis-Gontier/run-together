/** Fichiers de trace acceptés à l'import (côté client ; le serveur revérifie). */
export const MAX_TRACK_BYTES = 15 * 1024 * 1024
export const CSV_NAME = "activities.csv"

const TRACK_FILE = /\.(gpx|tcx|fit)(\.gz)?$/i

export const isTrackFile = (name: string) => TRACK_FILE.test(name)
