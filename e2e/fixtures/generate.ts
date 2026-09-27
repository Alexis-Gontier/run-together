/**
 * Génère les fichiers de trace des tests e2e, de façon déterministe : boucles autour de Paris,
 * datées en 2025, une date distincte par fichier (les doublons ±2 min et les « à confirmer »
 * ±30 min dépendent des dates). Les fichiers produits sont versionnés ; relancer après
 * modification : `pnpm exec tsx e2e/fixtures/generate.ts`.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"
import {
  Encoder,
  type FileIdMesg,
  Profile,
  type RecordMesg,
  type SessionMesg,
} from "@garmin/fitsdk"

const OUT = dirname(fileURLToPath(import.meta.url))
const FILES = join(OUT, "files")
const PARIS = { lat: 48.8566, lng: 2.3522 }
const M_PER_DEG = 111_320
const STEP_S = 5
const DEG_TO_SEMICIRCLE = 2 ** 31 / 180

type Point = {
  lat: number
  lng: number
  ele: number
  time: Date
  hr: number
  dist: number
}

/** Une boucle circulaire à vitesse constante, un point toutes les 5 s. */
function loop(start: string, radiusM: number, speed: number): Point[] {
  const t0 = new Date(start).getTime()
  const length = 2 * Math.PI * radiusM
  const n = Math.round(length / speed / STEP_S)
  const cosLat = Math.cos((PARIS.lat * Math.PI) / 180)
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (2 * Math.PI * i) / n
    return {
      lat: PARIS.lat + (radiusM * Math.sin(a)) / M_PER_DEG,
      lng: PARIS.lng + (radiusM * (1 - Math.cos(a))) / (M_PER_DEG * cosLat),
      ele: Math.round((35 + 6 * Math.sin(2 * a)) * 10) / 10,
      time: new Date(t0 + i * STEP_S * 1000),
      hr: 140 + Math.round(10 * Math.sin(a)),
      dist: Math.round((length * i) / n),
    }
  })
}

const iso = (d: Date) => d.toISOString().replace(/\.000Z$/, "Z")
const f6 = (n: number) => n.toFixed(6)

function gpx(name: string, type: string, points: Point[]): string {
  const pts = points
    .map(
      (p) =>
        `      <trkpt lat="${f6(p.lat)}" lon="${f6(p.lng)}"><ele>${p.ele}</ele><time>${iso(p.time)}</time></trkpt>`,
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="run-together-e2e" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><time>${iso(points[0].time)}</time></metadata>
  <trk>
    <name>${name}</name>
    <type>${type}</type>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>
`
}

function tcx(points: Point[]): string {
  const pts = points
    .map(
      (p) =>
        `          <Trackpoint><Time>${iso(p.time)}</Time><Position><LatitudeDegrees>${f6(p.lat)}</LatitudeDegrees><LongitudeDegrees>${f6(p.lng)}</LongitudeDegrees></Position><AltitudeMeters>${p.ele}</AltitudeMeters><DistanceMeters>${p.dist}</DistanceMeters><HeartRateBpm><Value>${p.hr}</Value></HeartRateBpm></Trackpoint>`,
    )
    .join("\n")
  const start = iso(points[0].time)
  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>${start}</Id>
      <Lap StartTime="${start}">
        <Calories>320</Calories>
        <Track>
${pts}
        </Track>
      </Lap>
      <Creator><Name>Forerunner e2e</Name></Creator>
    </Activity>
  </Activities>
</TrainingCenterDatabase>
`
}

function fitFile(points: Point[]): Uint8Array {
  const start = points[0].time
  const end = points[points.length - 1].time
  const encoder = new Encoder()
  const fileId: FileIdMesg = {
    type: "activity",
    manufacturer: "garmin",
    product: 0,
    timeCreated: start,
    serialNumber: 4242,
  }
  encoder.onMesg(Profile.MesgNum.FILE_ID, fileId)
  for (const p of points) {
    const record: RecordMesg = {
      timestamp: p.time,
      positionLat: Math.round(p.lat * DEG_TO_SEMICIRCLE),
      positionLong: Math.round(p.lng * DEG_TO_SEMICIRCLE),
      altitude: p.ele,
      heartRate: p.hr,
      distance: p.dist,
    }
    encoder.onMesg(Profile.MesgNum.RECORD, record)
  }
  const session: SessionMesg = {
    timestamp: end,
    startTime: start,
    sport: "running",
    subSport: "generic",
    totalCalories: 330,
  }
  encoder.onMesg(Profile.MesgNum.SESSION, session)
  return encoder.close()
}

function write(path: string, data: string | Uint8Array) {
  const full = join(FILES, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, data)
}

rmSync(FILES, { recursive: true, force: true })

// Import d'un fichier (un par format) + glisser-déposer + fil d'accueil.
write(
  "single/loop.gpx",
  gpx("Boucle GPX e2e", "running", loop("2025-03-02T07:00:00Z", 800, 3)),
)
write("single/loop.tcx", tcx(loop("2025-03-09T07:00:00Z", 850, 3)))
write("single/loop.fit", fitFile(loop("2025-03-16T07:00:00Z", 900, 3)))
write(
  "single/drop.gpx",
  gpx("Boucle déposée e2e", "running", loop("2025-03-23T07:00:00Z", 700, 3)),
)
write(
  "single/feed.gpx",
  gpx("Boucle du fil e2e", "running", loop("2025-03-30T07:00:00Z", 750, 3)),
)

// Import en masse : .gpx, copie (doublon), .gpx.gz, vélo, fichier cassé, .txt.
const bulkA = gpx(
  "Masse A e2e",
  "running",
  loop("2025-04-06T07:00:00Z", 800, 3),
)
write("bulk/a.gpx", bulkA)
write("bulk/a-copy.gpx", bulkA)
write(
  "bulk/b.gpx.gz",
  gzipSync(gpx("Masse B e2e", "running", loop("2025-04-13T07:00:00Z", 820, 3))),
)
write(
  "bulk/ride.gpx",
  gpx("Vélo e2e", "cycling", loop("2025-04-20T07:00:00Z", 2000, 7)),
)
write("bulk/broken.gpx", "<gpx><trk><trkseg><trkpt lat=")
write("bulk/notes.txt", "Pas une trace.\n")

// Dossier d'archive Strava : activities.csv + activities/.
write(
  "strava-archive/activities.csv",
  [
    "Activity ID,Activity Date,Activity Name,Activity Type,Filename",
    '101,"Apr 27, 2025, 7:00:00 AM",Sortie du dimanche,Run,activities/101.gpx',
    '102,"Apr 28, 2025, 7:00:00 AM",Vélotaf,Ride,activities/102.gpx',
    "",
  ].join("\n"),
)
write(
  "strava-archive/activities/101.gpx",
  gpx("Titre du fichier", "", loop("2025-04-27T07:00:00Z", 800, 3)),
)
write(
  "strava-archive/activities/102.gpx",
  gpx("Titre du fichier", "", loop("2025-04-28T07:00:00Z", 2000, 7)),
)

// Course proche d'une existante (départ à +15 min, autre distance) → « à confirmer ».
write(
  "nearby/first.gpx",
  gpx("Première e2e", "running", loop("2025-05-04T07:00:00Z", 800, 3)),
)
write(
  "nearby/second.gpx",
  gpx("Seconde e2e", "running", loop("2025-05-04T07:15:00Z", 950, 3)),
)
