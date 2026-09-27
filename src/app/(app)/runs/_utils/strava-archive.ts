import type { RunSportType } from "@/lib/runs/schemas"

/** Ce que `activities.csv` apprend d'un fichier : son titre Strava et son sport. */
export type ArchiveActivity = {
  name: string | null
  type: string
  // null : ce n'est pas une course (vélo, marche…), le fichier est ignoré.
  sportType: RunSportType | null
}

/** CSV RFC 4180 : champs entre guillemets, `""` échappé, retours à la ligne dans les champs. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** Type d'activité Strava (anglais ou français) → type de course, ou null si autre sport. */
export function stravaRunType(type: string): RunSportType | null {
  const t = type.toLowerCase()
  if (t.includes("trail")) return "TrailRun"
  if (/\brun\b|course|jog/.test(t))
    return t.includes("virtu") ? "VirtualRun" : "Run"
  return null
}

const norm = (h: string) => h.trim().toLowerCase().replace(/’/g, "'")
const HEADERS = {
  file: ["filename", "nom du fichier", "fichier"],
  name: ["activity name", "nom de l'activité"],
  type: ["activity type", "type d'activité", "type de l'activité"],
}
const baseName = (path: string) => path.split("/").pop() ?? path

/**
 * `activities.csv` de l'archive Strava → titre et sport par nom de fichier (`1234.fit.gz`).
 * Les colonnes sont cherchées par intitulé (anglais ou français) ; à défaut, la colonne des
 * fichiers est celle dont les valeurs commencent par `activities/`.
 */
export function parseActivitiesCsv(text: string): Map<string, ArchiveActivity> {
  const [header, ...rows] = parseCsv(text.replace(/^﻿/, ""))
  const result = new Map<string, ArchiveActivity>()
  if (!header) return result

  const col = (names: string[]) =>
    header.findIndex((h) => names.includes(norm(h)))
  let fileCol = col(HEADERS.file)
  if (fileCol < 0)
    fileCol = header.findIndex((_, i) =>
      rows.some((r) => r[i]?.startsWith("activities/")),
    )
  const nameCol = col(HEADERS.name)
  const typeCol = col(HEADERS.type)
  if (fileCol < 0 || typeCol < 0) return result

  for (const r of rows) {
    const file = r[fileCol]?.trim()
    if (!file) continue // activité saisie à la main sur Strava, sans fichier
    const type = r[typeCol]?.trim() ?? ""
    const name = nameCol >= 0 ? r[nameCol]?.trim().slice(0, 100) || null : null
    result.set(baseName(file), { name, type, sportType: stravaRunType(type) })
  }
  return result
}
