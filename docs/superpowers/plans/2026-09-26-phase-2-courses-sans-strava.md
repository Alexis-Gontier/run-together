# Phase 2 — Courses sans Strava : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (inline — préférence utilisateur : le moins de tokens). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** permettre de créer, éditer et supprimer des courses sans Strava — par formulaire ou par
import de fichier GPX/FIT — avec records perso et notification Discord, et masquer l'UI Strava.

**Architecture :** un pipeline indépendant de la source, `src/lib/runs/record-run.ts`, reçoit une
course normalisée et fait transaction → records perso → notification. Le formulaire, l'import de
fichier et l'import Strava (conservé) ne font que produire cette entrée normalisée. Le parsing
GPX/FIT est pur (sans I/O) et testé ; il vit dans `src/lib/runs/track/`.

**Tech Stack :** Next 16.3 Server Actions, next-safe-action 8, RHF + Zod v4, Prisma 7,
`fast-xml-parser` (GPX), `@garmin/fitsdk` (FIT, SDK officiel Garmin, pur JS), Vitest.

**Spec :** `docs/superpowers/specs/2026-09-26-refonte-roadmap-design.md` (section « Phase 2 »)

**Note d'exécution :** plan exécuté inline par le même agent. La logique métier (parsing, calculs,
records, schémas) est donnée en code complet avec ses tests ; les composants UI sont spécifiés
par leur structure, leurs props et leurs comportements, et suivent `.claude/skills/form/SKILL.md`.

## Global Constraints

- Branche `dev`. Messages de validation Zod **en français**. Types via `z.infer`.
- Formulaires : `standardSchemaResolver`. Actions : `authActionClient` + `.inputSchema()`.
- Routes via `ROUTES.*` / helpers de `src/lib/constants/routes.ts`, jamais en dur.
- Distances stockées en **mètres** (Int), durées en **secondes** (Int), allure en **s/km** (Int).
- `sportType` ∈ `"Run" | "TrailRun" | "VirtualRun"` (mêmes valeurs que Strava, VirtualRun = tapis).
- Validation : distance 0,1–300 km ; allure 2'00"–20'00"/km (120–1200 s/km) ; date ≤ maintenant.
- Records perso sans splits : course entière si distance ∈ [97 % ; 105 %] de la cible.
- Fichier importé ≤ 15 Mo, non stocké. Anti-doublon : même user, ±2 min, ±2 % de distance.
- Commits conventionnels, corps ≤ 100 caractères par ligne, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## Carte des fichiers

| Fichier | Action | Rôle |
| --- | --- | --- |
| `src/lib/runs/personal-records.ts` | déplacer depuis `lib/strava/` + modifier | records ; candidats sans splits |
| `src/lib/runs/pr-display.ts` | déplacer depuis `lib/strava/` | libellés PR |
| `src/lib/runs/personal-records.test.ts` | créer | tests `extractCandidates` |
| `src/lib/runs/pace.ts` (+ `.test.ts`) | créer | `computePace`, `defaultRunName` |
| `src/lib/runs/record-run.ts` | créer | `recordRun`, `removeRun` |
| `src/lib/runs/schemas.ts` (+ `.test.ts`) | créer | `recordRunInputSchema`, `trackDataSchema` |
| `src/lib/runs/track/*.ts` (+ tests) | créer | GPX, FIT, résumé de trace, polyline |
| `src/lib/runs/CLAUDE.md` | créer | doc du module |
| `src/lib/strava/import-activity.ts` | modifier | mapper Strava → `recordRun` |
| `src/lib/strava/create-run-from-activity.ts` | réécrire | `stravaActivityToRunInput` (pur) |
| `src/env.ts` | modifier | `STRAVA_ENABLED` |
| `src/app/api/strava/*` | modifier | 404 si Strava désactivé |
| `src/app/(app)/settings/page.tsx` | modifier | carte Strava masquée |
| `src/app/(onboarding)/onboarding/_components/step-first-run.tsx` | créer | étape 3 sans Strava |
| `src/lib/constants/routes.ts` | modifier | `RUN_NEW`, `editRunRoute` |
| `src/app/(app)/runs/_components/run-form.tsx` | créer | formulaire partagé new/edit |
| `src/app/(app)/runs/_components/track-dropzone.tsx` | créer | import GPX/FIT |
| `src/app/(app)/runs/_schemas/run-form-schema.ts` (+ test) | créer | schéma du formulaire |
| `src/app/(app)/runs/_actions/{create,update}-run-action.ts` | créer | écriture |
| `src/app/(app)/runs/_actions/parse-track-action.ts` | créer | parsing serveur |
| `src/app/(app)/runs/new/page.tsx` | créer | page création |
| `src/app/(app)/runs/[id]/edit/page.tsx` | créer | page édition |
| `src/app/(app)/runs/[id]/_actions/delete-run-action.ts` | modifier | recalcul des records |
| `src/app/(app)/runs/[id]/page.tsx` | modifier | bouton Modifier |
| `src/components/layout/app-sidebar/*`, `page-header.tsx` | modifier | entrée « Ajouter » + FAB mobile |
| `next.config.ts` | modifier | `serverActions.bodySizeLimit: "16mb"` |

---

### Task 1 : Module `lib/runs` + records perso sans splits

**Files :** `git mv src/lib/strava/personal-records.ts src/lib/runs/personal-records.ts`,
`git mv src/lib/strava/pr-display.ts src/lib/runs/pr-display.ts` ; mettre à jour les imports
(`profile-records.tsx`, `run-card.tsx`, `import-activity.ts`, `webhook/route.ts`,
`scripts/backfill-personal-records.ts` si concerné) ; créer `src/lib/runs/personal-records.test.ts`.

**Interfaces :** Produces :
`export function extractCandidates(run: RunForPR, splits: SplitForPR[]): PRCandidate[]` (désormais
exporté), types `RunForPR`, `SplitForPR`, `NewPR` exportés ;
`updatePersonalRecords(userId, run, splits): Promise<NewPR[]>` ;
`recalculatePersonalRecords(userId): Promise<void>` (inchangés).

- [ ] **Step 1 : tests (échouent : `extractCandidates` non exporté, règle absente)**

```ts
import { describe, expect, it } from "vitest"
import { extractCandidates } from "./personal-records"

const km = (n: number, pace = 300) =>
  Array.from({ length: n }, (_, i) => ({
    kilometer: i + 1,
    distance: 1000,
    duration: pace,
    pace,
  }))

describe("extractCandidates", () => {
  it("fenêtre glissante sur les splits pour 1/5/10 km", () => {
    const run = { id: "r", distance: 10000, duration: 3000, pace: 300 }
    const d = extractCandidates(run, km(10)).map((c) => c.distance)
    expect(d).toEqual(expect.arrayContaining(["KM_1", "KM_5", "KM_10"]))
  })

  it("sans splits : la course entière compte si distance dans [97 % ; 105 %]", () => {
    const run = { id: "r", distance: 5100, duration: 1500, pace: 294 }
    const c = extractCandidates(run, [])
    expect(c).toEqual([
      { distance: "KM_5", runId: "r", duration: 1500, pace: 294 },
    ])
  })

  it("sans splits : hors tolérance, aucun candidat", () => {
    const run = { id: "r", distance: 5400, duration: 1600, pace: 296 }
    expect(extractCandidates(run, [])).toEqual([])
  })

  it("semi : course entière ≥ 97 % de 21,0975 km", () => {
    const run = { id: "r", distance: 20500, duration: 6000, pace: 293 }
    expect(extractCandidates(run, []).map((c) => c.distance)).toEqual([
      "HALF_MARATHON",
    ])
  })
})
```

Run : `pnpm test src/lib/runs` → FAIL.

- [ ] **Step 2 : implémentation** — dans `extractCandidates`, remplacer la branche fenêtre :

```ts
    if (config.splitWindow !== null) {
      // Pas de splits (saisie manuelle, fichier sans GPS) : la course entière ne compte que si
      // sa distance colle à la cible — un 10,3 km n'est pas un temps sur 10 km.
      if (sorted.length === 0) {
        if (
          run.distance >= config.meters * 0.97 &&
          run.distance <= config.meters * 1.05
        ) {
          results.push({
            distance: key,
            runId: run.id,
            duration: run.duration,
            pace: run.pace,
          })
        }
        continue
      }
      const w = config.splitWindow
      if (sorted.length < w) continue
      // … boucle existante inchangée
```

Exporter `extractCandidates` et les types `RunForPR`, `SplitForPR`, `PRCandidate`.

- [ ] **Step 3 :** `pnpm test && pnpm typecheck && pnpm knip` → PASS.
- [ ] **Step 4 : commit** `refactor: move personal records to lib/runs and support runs without splits`

---

### Task 2 : Allure, nom par défaut, schéma d'entrée normalisé

**Files :** créer `src/lib/runs/pace.ts`, `pace.test.ts`, `schemas.ts`, `schemas.test.ts`.

**Interfaces :** Produces :
- `computePace(distanceM: number, durationS: number): number` (s/km arrondi, 0 si distance 0)
- `defaultRunName(date: Date): string`
- `RUN_SPORT_TYPES = ["Run", "TrailRun", "VirtualRun"] as const`, `RunSportType`
- `splitInputSchema`, `trackDataSchema` (`TrackData`), `recordRunInputSchema` (`RecordRunInput`)

- [ ] **Step 1 : tests**

`pace.test.ts` :

```ts
import { describe, expect, it } from "vitest"
import { computePace, defaultRunName } from "./pace"

describe("computePace", () => {
  it("10 km en 50 min → 300 s/km", () => {
    expect(computePace(10000, 3000)).toBe(300)
  })
  it("arrondit", () => {
    expect(computePace(4200, 1234)).toBe(294)
  })
  it("distance nulle → 0", () => {
    expect(computePace(0, 100)).toBe(0)
  })
})

describe("defaultRunName", () => {
  const at = (h: number) => new Date(2026, 8, 26, h, 0)
  it.each([
    [6, "Course du matin"],
    [11, "Course du matin"],
    [12, "Course du midi"],
    [15, "Course de l'après-midi"],
    [19, "Course du soir"],
    [23, "Course de nuit"],
    [3, "Course de nuit"],
  ])("%ih → %s", (h, name) => {
    expect(defaultRunName(at(h))).toBe(name)
  })
})
```

`schemas.test.ts` :

```ts
import { describe, expect, it } from "vitest"
import { recordRunInputSchema } from "./schemas"

const base = {
  name: "Sortie",
  sportType: "Run",
  distance: 10000,
  duration: 3000,
  elevation: 50,
  date: new Date("2026-09-20T07:00:00Z"),
  splits: [],
}

describe("recordRunInputSchema", () => {
  it("accepte une course valide", () => {
    expect(recordRunInputSchema.safeParse(base).success).toBe(true)
  })
  it("refuse une allure plus rapide que 2'00\"/km", () => {
    const r = recordRunInputSchema.safeParse({ ...base, duration: 1000 })
    expect(r.success).toBe(false)
  })
  it("refuse une allure plus lente que 20'00\"/km", () => {
    const r = recordRunInputSchema.safeParse({ ...base, duration: 13000 })
    expect(r.success).toBe(false)
  })
  it("refuse une date future", () => {
    const r = recordRunInputSchema.safeParse({
      ...base,
      date: new Date(Date.now() + 3_600_000),
    })
    expect(r.success).toBe(false)
  })
  it("refuse > 300 km", () => {
    const r = recordRunInputSchema.safeParse({
      ...base,
      distance: 300_001,
      duration: 300_001 * 0.5,
    })
    expect(r.success).toBe(false)
  })
})
```

Run → FAIL (modules absents).

- [ ] **Step 2 : `pace.ts`**

```ts
export function computePace(distanceM: number, durationS: number): number {
  if (distanceM <= 0) return 0
  return Math.round((durationS / distanceM) * 1000)
}

/** Nom proposé quand l'utilisateur n'en donne pas, d'après l'heure locale de départ. */
export function defaultRunName(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return "Course du matin"
  if (h >= 12 && h < 14) return "Course du midi"
  if (h >= 14 && h < 18) return "Course de l'après-midi"
  if (h >= 18 && h < 22) return "Course du soir"
  return "Course de nuit"
}
```

- [ ] **Step 3 : `schemas.ts`**

```ts
import { z } from "zod"
import { computePace } from "./pace"

export const RUN_SPORT_TYPES = ["Run", "TrailRun", "VirtualRun"] as const
export type RunSportType = (typeof RUN_SPORT_TYPES)[number]

export const MIN_PACE = 120 // 2'00"/km
export const MAX_PACE = 1200 // 20'00"/km

export const splitInputSchema = z.object({
  kilometer: z.int().positive(),
  distance: z.number().positive(),
  duration: z.int().nonnegative(),
  heartRate: z.int().positive().nullable(),
  elevation: z.number().nullable(),
})
export type SplitInput = z.infer<typeof splitInputSchema>

/** Données de trace issues d'un fichier GPX/FIT, renvoyées au formulaire puis à l'enregistrement. */
export const trackDataSchema = z.object({
  polyline: z.string().nullable(),
  summaryPolyline: z.string().nullable(),
  startLat: z.number().nullable(),
  startLng: z.number().nullable(),
  deviceName: z.string().max(100).nullable(),
  splits: z.array(splitInputSchema).max(400),
})
export type TrackData = z.infer<typeof trackDataSchema>

/** Entrée normalisée de `recordRun`, quelle que soit la source. */
export const recordRunInputSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis.").max(100),
    sportType: z.enum(RUN_SPORT_TYPES),
    distance: z
      .int()
      .min(100, "Distance minimale : 0,1 km.")
      .max(300_000, "Distance maximale : 300 km."),
    duration: z.int().positive("La durée est requise."),
    elevation: z.int().min(0).max(20_000).default(0),
    date: z
      .date()
      .refine((d) => d.getTime() <= Date.now() + 60_000, {
        message: "La date ne peut pas être dans le futur.",
      }),
    heartRateAvg: z.int().min(30).max(250).nullish(),
    heartRateMax: z.int().min(30).max(250).nullish(),
    cadenceAvg: z.int().min(20).max(300).nullish(),
    calories: z.int().min(0).max(20_000).nullish(),
    splits: z.array(splitInputSchema).max(400).default([]),
    polyline: z.string().nullish(),
    summaryPolyline: z.string().nullish(),
    startLat: z.number().nullish(),
    startLng: z.number().nullish(),
    deviceName: z.string().max(100).nullish(),
  })
  .refine(
    (r) => {
      const p = computePace(r.distance, r.duration)
      return p >= MIN_PACE && p <= MAX_PACE
    },
    {
      message: "Allure improbable : elle doit être entre 2'00\" et 20'00\" /km.",
      path: ["duration"],
    },
  )
export type RecordRunInput = z.infer<typeof recordRunInputSchema>
```

- [ ] **Step 4 :** `pnpm test` → PASS. **Commit** `feat: add run pace helpers and normalized run input schema`

---

### Task 3 : Pipeline `recordRun` / `removeRun` + Strava branché dessus

**Files :** créer `src/lib/runs/record-run.ts` ; réécrire
`src/lib/strava/create-run-from-activity.ts` ; modifier `src/lib/strava/import-activity.ts`,
`src/app/(app)/runs/[id]/_actions/delete-run-action.ts`.

**Interfaces :** Produces :

```ts
type RecordRunOptions = {
  userId: string
  userName: string
  source: RunSource
  stravaId?: string
  notify: boolean
  replaceExisting?: boolean // supprime d'abord la course de même stravaId
}
export async function recordRun(
  input: RecordRunInput,
  options: RecordRunOptions,
): Promise<{ run: Run; newPRs: NewPR[] }>

export async function removeRun(userId: string, runId: string): Promise<void>

export function findDuplicateRun(
  userId: string,
  input: Pick<RecordRunInput, "date" | "distance">,
  excludeRunId?: string,
): Promise<{ id: string } | null>
```

`stravaActivityToRunInput(activity): RecordRunInput` (pur, dans `create-run-from-activity.ts`).

- [ ] **Step 1 : `record-run.ts`**

```ts
import type { Run, RunSource } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { sendRunNotification } from "@/lib/discord"
import { computePace } from "./pace"
import {
  type NewPR,
  recalculatePersonalRecords,
  updatePersonalRecords,
} from "./personal-records"
import type { RecordRunInput } from "./schemas"

type RecordRunOptions = {
  userId: string
  userName: string
  source: RunSource
  stravaId?: string
  notify: boolean
  replaceExisting?: boolean
}

/**
 * Seul chemin d'écriture d'une nouvelle course, quelle que soit la source (formulaire, fichier,
 * Strava). Les étapes après la transaction ne font jamais échouer l'enregistrement.
 */
export async function recordRun(
  input: RecordRunInput,
  options: RecordRunOptions,
): Promise<{ run: Run; newPRs: NewPR[] }> {
  const { userId, source, stravaId } = options

  const run = await prisma.$transaction(async (tx) => {
    if (options.replaceExisting && stravaId) {
      await tx.run.deleteMany({ where: { stravaId, userId } })
    }
    const created = await tx.run.create({
      data: {
        userId,
        source,
        stravaId: stravaId ?? null,
        name: input.name,
        sportType: input.sportType,
        distance: input.distance,
        duration: input.duration,
        pace: computePace(input.distance, input.duration),
        elevation: input.elevation,
        date: input.date,
        heartRateAvg: input.heartRateAvg ?? null,
        heartRateMax: input.heartRateMax ?? null,
        cadenceAvg: input.cadenceAvg ?? null,
        calories: input.calories ?? null,
        polyline: input.polyline ?? null,
        summaryPolyline: input.summaryPolyline ?? null,
        startLat: input.startLat ?? null,
        startLng: input.startLng ?? null,
        deviceName: input.deviceName ?? null,
      },
    })
    if (input.splits.length > 0) {
      await tx.split.createMany({
        data: input.splits.map((s) => ({
          runId: created.id,
          kilometer: s.kilometer,
          distance: s.distance,
          duration: s.duration,
          pace: computePace(s.distance, s.duration),
          heartRate: s.heartRate,
          elevation: s.elevation,
        })),
      })
    }
    return created
  })

  let newPRs: NewPR[] = []
  try {
    newPRs = await updatePersonalRecords(
      userId,
      run,
      input.splits.map((s) => ({
        kilometer: s.kilometer,
        distance: s.distance,
        duration: s.duration,
        pace: computePace(s.distance, s.duration),
      })),
    )
  } catch (err) {
    console.error("[personal-records] update failed", run.id, err)
  }

  if (options.notify) {
    try {
      await sendRunNotification({
        runId: run.id,
        userName: options.userName,
        runName: run.name || "Course sans nom",
      })
    } catch (err) {
      console.error("[discord] run notification failed", run.id, err)
    }
  }

  return { run, newPRs }
}

/** Supprime une course de l'utilisateur et recalcule ses records (elle en portait peut-être). */
export async function removeRun(userId: string, runId: string): Promise<void> {
  await prisma.run.delete({ where: { id: runId, userId } })
  try {
    await recalculatePersonalRecords(userId)
  } catch (err) {
    console.error("[personal-records] recalculate failed after delete", err)
  }
}

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000

/** Même utilisateur, départ à ±2 min et distance à ±2 % : très probablement la même course. */
export function findDuplicateRun(
  userId: string,
  input: Pick<RecordRunInput, "date" | "distance">,
  excludeRunId?: string,
) {
  return prisma.run.findFirst({
    where: {
      userId,
      id: excludeRunId ? { not: excludeRunId } : undefined,
      date: {
        gte: new Date(input.date.getTime() - DUPLICATE_WINDOW_MS),
        lte: new Date(input.date.getTime() + DUPLICATE_WINDOW_MS),
      },
      distance: {
        gte: Math.floor(input.distance * 0.98),
        lte: Math.ceil(input.distance * 1.02),
      },
    },
    select: { id: true },
  })
}
```

- [ ] **Step 2 : `create-run-from-activity.ts` devient un mapper pur**

```ts
import type { z } from "zod"
import type { RecordRunInput } from "@/lib/runs/schemas"
import type { stravaActivityDetailSchema } from "./schemas"

type StravaActivityDetail = z.infer<typeof stravaActivityDetailSchema>

const round = (v: number | null | undefined) => (v == null ? null : Math.round(v))

export function stravaActivityToRunInput(
  activity: StravaActivityDetail,
): RecordRunInput {
  return {
    name: activity.name,
    sportType: activity.sport_type as RecordRunInput["sportType"],
    distance: Math.round(activity.distance),
    duration: activity.moving_time,
    elevation: Math.round(activity.total_elevation_gain),
    date: new Date(activity.start_date),
    heartRateAvg: round(activity.average_heartrate),
    heartRateMax: round(activity.max_heartrate),
    cadenceAvg: round(activity.average_cadence),
    calories: round(activity.calories),
    startLat: activity.start_latlng?.[0] ?? null,
    startLng: activity.start_latlng?.[1] ?? null,
    summaryPolyline: activity.map?.summary_polyline ?? null,
    polyline: activity.map?.polyline ?? null,
    deviceName: activity.device_name ?? null,
    splits: (activity.splits_metric ?? []).map((s) => ({
      kilometer: s.split,
      distance: s.distance,
      duration: s.moving_time,
      heartRate: round(s.average_heartrate),
      elevation: s.elevation_difference ?? null,
    })),
  }
}
```

(Le schéma Strava n'est **pas** repassé par `recordRunInputSchema` : les données Strava
historiques peuvent sortir des bornes d'allure — marche, pauses — et doivent rester importables.)

- [ ] **Step 3 : `import-activity.ts`** — après les contrôles existants (type de sport, doublon
`stravaId`), remplacer la transaction, le calcul des splits, `updatePersonalRecords` et l'envoi
Discord par :

```ts
  await recordRun(stravaActivityToRunInput(activity), {
    userId,
    userName: account.user.name ?? "Inconnu",
    source: RunSource.STRAVA,
    stravaId: String(activityId),
    notify: !options.silent,
    replaceExisting: options.replaceExisting,
  })
```

- [ ] **Step 4 : `delete-run-action.ts`** — corrige un bug existant (les records d'une course
supprimée restaient affichés) :

```ts
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    await removeRun(user.id, id)
  })
```

- [ ] **Step 5 :** `pnpm typecheck && pnpm test && pnpm knip && pnpm lint` → PASS.
**Commit** `refactor: extract source-agnostic recordRun pipeline`

---

### Task 4 : Flag `STRAVA_ENABLED` et UI Strava masquée

**Files :** `src/env.ts`, `.env.example`, `vitest.config.mts`, `src/app/api/strava/{connect,callback,disconnect,webhook}/route.ts`,
`src/app/(app)/settings/page.tsx`, `src/app/(onboarding)/onboarding/page.tsx`,
`.../onboarding-wizard.tsx`, créer `.../step-first-run.tsx`.

**Interfaces :** Produces : `env.STRAVA_ENABLED: boolean` (server). La wizard reçoit
`stravaEnabled: boolean` en prop.

- [ ] **Step 1 : env** — bloc `server` :

```ts
    // L'app Strava est inactive depuis le 19/08/2026 : UI, OAuth et webhook coupés par défaut.
    STRAVA_ENABLED: z.stringbool().default(false),
```

Ajouter `STRAVA_ENABLED=false` à `.env.example`.

- [ ] **Step 2 : routes API** — en tête de chaque handler (`GET`/`POST`) des quatre routes :

```ts
  if (!env.STRAVA_ENABLED) return new NextResponse(null, { status: 404 })
```

- [ ] **Step 3 : settings** — rendre `<StravaCard … />` seulement si `env.STRAVA_ENABLED`, et ne
lancer `getStravaConnectionAction()` / `getWebhookStatus()` que dans ce cas.

- [ ] **Step 4 : onboarding** — `page.tsx` passe `stravaEnabled={env.STRAVA_ENABLED}` ;
`onboarding-wizard.tsx` rend `step === 3 && (stravaEnabled ? <StepStrava …/> : <StepFirstRun …/>)`.
`StepFirstRun` : même carte que `StepStrava` (en-tête icône `Plus`, titre « Ta première course »,
description « Saisie manuelle ou fichier GPX/FIT »), texte expliquant qu'on peut saisir une course
à la main ou importer le fichier exporté de sa montre ; pied : bouton Retour, bouton
« Terminer » qui appelle `completeOnboardingAction` puis `router.push(ROUTES.RUN_NEW)`, bouton
fantôme « Plus tard » qui l'appelle puis `router.push(ROUTES.HOME)`.

- [ ] **Step 5 : vérifier** — `pnpm typecheck && pnpm build` ; `curl -s -o /dev/null -w "%{http_code}" localhost:3000/api/strava/webhook` sous `pnpm dev` → `404`.
**Commit** `feat: hide strava integration behind STRAVA_ENABLED flag`

---

### Task 5 : Parsing de trace GPX / FIT

**Files :** créer dans `src/lib/runs/track/` : `types.ts`, `geo.ts`, `encode-polyline.ts`,
`summarize-track.ts`, `parse-gpx.ts`, `parse-fit.ts`, `parse-track.ts`, et leurs `*.test.ts`.

**Interfaces :** Produces :

```ts
// types.ts
export type TrackPoint = {
  lat: number | null
  lng: number | null
  ele: number | null
  time: Date
  hr: number | null
  cad: number | null
  dist: number | null // distance cumulée fournie par l'appareil (FIT), en mètres
}
export type ParsedTrack = {
  points: TrackPoint[]
  name: string | null
  sportType: RunSportType | null
  deviceName: string | null
  calories: number | null
}
export type TrackSummary = {
  name: string | null
  sportType: RunSportType
  date: Date
  distance: number
  duration: number
  elevation: number
  heartRateAvg: number | null
  heartRateMax: number | null
  cadenceAvg: number | null
  calories: number | null
  track: TrackData
}

// parse-track.ts
export async function parseTrackFile(
  fileName: string,
  bytes: Uint8Array,
): Promise<TrackSummary> // throw TrackParseError (message FR) si illisible
```

Constantes de `summarize-track.ts` : pause = vitesse < 0,5 m/s **ou** écart > 30 s entre deux
points sans déplacement (> 10 m) ; D+ cumulé avec hystérésis de 3 m ; splits interpolés au
kilomètre ; `summaryPolyline` = trace sous-échantillonnée à ≤ 200 points.

- [ ] **Step 1 : dépendances** `pnpm add fast-xml-parser @garmin/fitsdk`. Vérifier que
`@garmin/fitsdk` exporte `Decoder`, `Stream` et (pour les tests) `Encoder` :
`node -e "const f=require('@garmin/fitsdk');console.log(Object.keys(f))"`. Si le paquet est ESM
seul, utiliser `import("@garmin/fitsdk")` dans le `node -e`.

- [ ] **Step 2 : `encode-polyline.ts` + test (exemple officiel Google)**

```ts
// encode-polyline.test.ts
import { expect, it } from "vitest"
import { encodePolyline } from "./encode-polyline"

it("encode l'exemple de la documentation Google", () => {
  expect(
    encodePolyline([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]),
  ).toBe("_p~iF~ps|U_ulLnnqC_mqNvxq`@")
})
```

```ts
// encode-polyline.ts — algorithme « Encoded Polyline » de Google, précision 1e5.
function encodeValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1
  let out = ""
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return out + String.fromCharCode(v + 63)
}

export function encodePolyline(coords: [number, number][]): string {
  let prevLat = 0
  let prevLng = 0
  let out = ""
  for (const [lat, lng] of coords) {
    const iLat = Math.round(lat * 1e5)
    const iLng = Math.round(lng * 1e5)
    out += encodeValue(iLat - prevLat) + encodeValue(iLng - prevLng)
    prevLat = iLat
    prevLng = iLng
  }
  return out
}
```

- [ ] **Step 3 : `geo.ts`**

```ts
const R = 6_371_000

/** Distance orthodromique en mètres. */
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
```

Test : Paris (48.8566, 2.3522) → Lyon (45.764, 4.8357) ≈ 392 km (`toBeCloseTo(392_000, -4)`).

- [ ] **Step 4 : `summarize-track.ts` + tests**

Tests (points synthétiques : une ligne droite vers le nord, 1 point / 10 s, 30 m / point =
3 m/s → 1 km toutes les 333 s) :

```ts
import { describe, expect, it } from "vitest"
import { summarizeTrack } from "./summarize-track"
import type { ParsedTrack, TrackPoint } from "./types"

const M_PER_DEG_LAT = 111_195
function line(n: number, opts: { pauseAt?: number; climb?: number } = {}) {
  const pts: TrackPoint[] = []
  let t = Date.UTC(2026, 8, 20, 7, 0, 0)
  for (let i = 0; i < n; i++) {
    if (opts.pauseAt === i) t += 300_000 // 5 min d'arrêt
    pts.push({
      lat: 45 + (i * 30) / M_PER_DEG_LAT,
      lng: 5,
      ele: opts.climb ? i * opts.climb : 200,
      time: new Date(t),
      hr: 150,
      cad: 85,
      dist: null,
    })
    t += 10_000
  }
  return pts
}
const parsed = (points: TrackPoint[]): ParsedTrack => ({
  points,
  name: null,
  sportType: null,
  deviceName: "Garmin",
  calories: null,
})

describe("summarizeTrack", () => {
  it("distance, durée et splits d'une ligne de 3 km", () => {
    const s = summarizeTrack(parsed(line(101)))
    expect(s.distance).toBeGreaterThan(2990)
    expect(s.distance).toBeLessThan(3010)
    expect(s.duration).toBe(1000)
    expect(s.track.splits).toHaveLength(3)
    expect(s.track.splits[0].duration).toBeGreaterThanOrEqual(332)
    expect(s.track.splits[0].duration).toBeLessThanOrEqual(334)
    expect(s.heartRateAvg).toBe(150)
    expect(s.sportType).toBe("Run")
  })
  it("exclut les pauses du temps en mouvement", () => {
    const s = summarizeTrack(parsed(line(101, { pauseAt: 50 })))
    expect(s.duration).toBe(1000)
  })
  it("cumule le D+ au-delà de l'hystérésis", () => {
    const s = summarizeTrack(parsed(line(101, { climb: 1 })))
    expect(s.elevation).toBeGreaterThanOrEqual(97)
    expect(s.elevation).toBeLessThanOrEqual(100)
  })
  it("encode une polyline et une polyline résumée", () => {
    const s = summarizeTrack(parsed(line(500)))
    expect(s.track.polyline).toBeTruthy()
    expect(s.track.startLat).toBeCloseTo(45)
    expect(s.track.summaryPolyline!.length).toBeLessThan(
      s.track.polyline!.length,
    )
  })
  it("échoue sans point horodaté", () => {
    expect(() => summarizeTrack(parsed([]))).toThrow()
  })
})
```

Implémentation :

```ts
import type { TrackData } from "../schemas"
import { encodePolyline } from "./encode-polyline"
import { haversine } from "./geo"
import { type ParsedTrack, TrackParseError, type TrackSummary } from "./types"

const PAUSE_SPEED = 0.5 // m/s
const PAUSE_GAP_S = 30
const ELE_HYSTERESIS = 3 // m
const SUMMARY_MAX_POINTS = 200

export function summarizeTrack(parsed: ParsedTrack): TrackSummary {
  const pts = parsed.points
  if (pts.length < 2) throw new TrackParseError("Le fichier ne contient aucun point exploitable.")

  let distance = 0
  let moving = 0
  let gain = 0
  let eleRef = pts.find((p) => p.ele != null)?.ele ?? null

  // Frontières de split : distance cumulée → temps en mouvement cumulé.
  const splits: TrackData["splits"] = []
  let splitStartMoving = 0
  let splitStartGain = 0
  let splitHr: number[] = []
  let nextKm = 1000

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dt = (b.time.getTime() - a.time.getTime()) / 1000
    if (dt <= 0) continue

    const d =
      a.dist != null && b.dist != null
        ? Math.max(0, b.dist - a.dist)
        : a.lat != null && a.lng != null && b.lat != null && b.lng != null
          ? haversine(a.lat, a.lng, b.lat, b.lng)
          : 0

    const paused = d / dt < PAUSE_SPEED || (dt > PAUSE_GAP_S && d < 10)
    if (!paused) {
      // Interpoler la frontière de kilomètre franchie dans ce segment.
      while (distance + d >= nextKm) {
        const frac = (nextKm - distance) / d
        const at = moving + dt * frac
        splits.push({
          kilometer: splits.length + 1,
          distance: 1000,
          duration: Math.round(at - splitStartMoving),
          heartRate: avg(splitHr),
          elevation: null,
        })
        splitStartMoving = at
        splitHr = []
        nextKm += 1000
      }
      distance += d
      moving += dt
    }
    if (b.hr != null) splitHr.push(b.hr)

    if (b.ele != null && eleRef != null) {
      if (b.ele - eleRef >= ELE_HYSTERESIS) {
        gain += b.ele - eleRef
        eleRef = b.ele
      } else if (eleRef - b.ele >= ELE_HYSTERESIS) {
        eleRef = b.ele
      }
    }
  }

  const rest = distance - (nextKm - 1000)
  if (rest >= 50) {
    splits.push({
      kilometer: splits.length + 1,
      distance: Math.round(rest),
      duration: Math.round(moving - splitStartMoving),
      heartRate: avg(splitHr),
      elevation: null,
    })
  }
  void splitStartGain

  const coords = pts
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => [p.lat, p.lng] as [number, number])
  const step = Math.max(1, Math.ceil(coords.length / SUMMARY_MAX_POINTS))
  const summary = coords.filter((_, i) => i % step === 0 || i === coords.length - 1)

  const hrs = pts.map((p) => p.hr).filter((v): v is number => v != null)
  const cads = pts.map((p) => p.cad).filter((v): v is number => v != null)

  return {
    name: parsed.name,
    sportType: parsed.sportType ?? "Run",
    date: pts[0].time,
    distance: Math.round(distance),
    duration: Math.round(moving),
    elevation: Math.round(gain),
    heartRateAvg: avg(hrs),
    heartRateMax: hrs.length ? Math.max(...hrs) : null,
    cadenceAvg: avg(cads),
    calories: parsed.calories,
    track: {
      polyline: coords.length ? encodePolyline(coords) : null,
      summaryPolyline: summary.length ? encodePolyline(summary) : null,
      startLat: coords[0]?.[0] ?? null,
      startLng: coords[0]?.[1] ?? null,
      deviceName: parsed.deviceName,
      splits,
    },
  }
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length)
}
```

(Retirer `splitStartGain` / `void` à l'implémentation si l'élévation par split n'est pas
calculée — la colonne `Split.elevation` reste `null` pour les fichiers ; c'est une
information que seul Strava fournissait.)

`types.ts` exporte aussi :

```ts
export class TrackParseError extends Error {}
```

- [ ] **Step 5 : `parse-gpx.ts` + test**

Test : chaîne GPX inline (3 `trkpt` avec `ele`, `time`, extension `gpxtpx:hr`), attendre
3 points, `hr` lus, `name` lu depuis `<trk><name>`, `sportType` `"TrailRun"` si
`<type>trail_running</type>`.

Implémentation : `XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", removeNSPrefix: true, isArray: (n) => ["trk", "trkseg", "trkpt"].includes(n) })`.
Parcourir `gpx.trk[].trkseg[].trkpt[]` ; `lat`/`lon` = attributs `Number()` ; `ele` ;
`time` → `new Date()` (point ignoré si absent ou invalide) ; `extensions.TrackPointExtension.hr`
et `.cad` ; `deviceName` = attribut `creator` de `<gpx>` ; `sportType` depuis `trk.type`
(`running|run` → `"Run"`, contient `trail` → `"TrailRun"`, `treadmill|virtual` → `"VirtualRun"`,
sinon `null`). Lever `TrackParseError("Fichier GPX invalide.")` si `gpx` absent.

- [ ] **Step 6 : `parse-fit.ts` + test**

Test : construire un FIT minimal avec `Encoder` du SDK (message `fileId`, 3 messages `record`
avec `timestamp`, `positionLat`/`positionLong` en semicercles, `heartRate`, `distance`, un message
`session` avec `sport: "running"`, `totalCalories`), le décoder, vérifier 3 points, coordonnées
en degrés (`semicercles × 180 / 2³¹`), `calories`, `sportType: "Run"`. Si le SDK n'expose pas
d'`Encoder`, placer une vraie activité courte exportée de Garmin dans
`src/lib/runs/track/__fixtures__/short-run.fit` et tester dessus.

Implémentation : `const stream = Stream.fromByteArray(bytes)`, `Decoder.isFIT(stream)` sinon
`TrackParseError("Fichier FIT invalide.")` ; `new Decoder(stream).read({ convertDateTimesToDates: true, applyScaleAndOffset: true })` ;
`errors.length` → `TrackParseError` ; `messages.recordMesgs` → points (`enhancedAltitude ?? altitude`,
`distance`, `heartRate`, `cadence`) ; `sessionMesgs[0].sport` / `subSport`
(`trail` → TrailRun, `treadmill`/`virtualActivity` → VirtualRun, `running` → Run, autre →
`TrackParseError("Ce fichier n'est pas une course à pied.")`) ; `totalCalories` ;
`deviceInfoMesgs`/`fileIdMesgs[0].manufacturer` + `garminProduct` → `deviceName`.

- [ ] **Step 7 : `parse-track.ts`**

```ts
import { parseFit } from "./parse-fit"
import { parseGpx } from "./parse-gpx"
import { summarizeTrack } from "./summarize-track"
import { TrackParseError, type TrackSummary } from "./types"

export async function parseTrackFile(
  fileName: string,
  bytes: Uint8Array,
): Promise<TrackSummary> {
  const ext = fileName.toLowerCase().split(".").pop()
  if (ext === "gpx") return summarizeTrack(parseGpx(new TextDecoder().decode(bytes)))
  if (ext === "fit") return summarizeTrack(await parseFit(bytes))
  throw new TrackParseError("Format non pris en charge : utilise un fichier .gpx ou .fit.")
}
```

- [ ] **Step 8 :** `pnpm test && pnpm typecheck && pnpm knip` → PASS.
**Commit** `feat: parse gpx and fit tracks into run summaries`

---

### Task 6 : Routes, schéma de formulaire et actions

**Files :** `src/lib/constants/routes.ts`, `next.config.ts`,
`src/app/(app)/runs/_schemas/run-form-schema.ts` (+ test),
`src/app/(app)/runs/_actions/{create-run,update-run,parse-track}-action.ts`.

**Interfaces :** Produces :
- `ROUTES.RUN_NEW = "/runs/new"`, `editRunRoute(id) => \`/runs/${id}/edit\``
- `runFormSchema` / `RunFormValues` (côté client) ; `runFormToInput(values, track): RecordRunInput`
- `createRunAction({ values: RecordRunInput-like, publish: boolean })` →
  `{ runId } | { error }` ; `updateRunAction({ id, values })` → `{ runId } | { error }` ;
  `parseTrackAction(formData)` → `TrackSummary` sérialisé (`date` en ISO) `| { error }`.

- [ ] **Step 1 : `runFormSchema`**

```ts
import { z } from "zod"
import { RUN_SPORT_TYPES, trackDataSchema } from "@/lib/runs/schemas"

const optionalInt = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(min).max(max)])
    .transform((v) => (v === "" ? null : v))

export const runFormSchema = z
  .object({
    name: z.string().trim().max(100),
    sportType: z.enum(RUN_SPORT_TYPES),
    date: z.iso.date("Date invalide."),
    time: z.iso.time({ precision: -1, error: "Heure invalide." }),
    distanceKm: z.coerce
      .number("Distance invalide.")
      .min(0.1, "Distance minimale : 0,1 km.")
      .max(300, "Distance maximale : 300 km."),
    hours: z.coerce.number().int().min(0).max(99),
    minutes: z.coerce.number().int().min(0).max(59),
    seconds: z.coerce.number().int().min(0).max(59),
    elevation: optionalInt(0, 20_000),
    heartRateAvg: optionalInt(30, 250),
    heartRateMax: optionalInt(30, 250),
    cadenceAvg: optionalInt(20, 300),
    calories: optionalInt(0, 20_000),
    publishToDiscord: z.boolean(),
    track: trackDataSchema.nullable(),
  })
  .refine((v) => v.hours * 3600 + v.minutes * 60 + v.seconds > 0, {
    message: "La durée est requise.",
    path: ["minutes"],
  })
export type RunFormInput = z.input<typeof runFormSchema>
export type RunFormValues = z.output<typeof runFormSchema>
```

`runFormToInput(values: RunFormValues): RecordRunInput` (dans le même fichier) : `date` =
`new Date(\`${values.date}T${values.time}\`)` **calculé dans le navigateur** (heure locale de
l'utilisateur), `distance = Math.round(distanceKm * 1000)`,
`duration = h*3600 + m*60 + s`, `name || defaultRunName(date)`, `elevation ?? 0`, et étale
`values.track` (`splits`, polylines, `startLat/Lng`, `deviceName`) ou des valeurs vides.

Tests : `runFormToInput` sur une saisie « 10,5 km en 52:30 le 2026-09-20 07:15 » →
`distance 10500`, `duration 3150`, `name "Course du matin"` ; champ optionnel `""` → `null` ;
durée nulle → erreur sur `minutes`.

- [ ] **Step 2 : `next.config.ts`** — ajouter :

```ts
  experimental: {
    authInterrupts: true,
    // Import de fichiers GPX/FIT (≤ 15 Mo) via Server Action ; défaut Next : 1 Mo.
    serverActions: { bodySizeLimit: "16mb" },
  },
```

- [ ] **Step 3 : `create-run-action.ts`**

```ts
"use server"

import { z } from "zod"
import { RunSource } from "@/generated/prisma/client"
import { findDuplicateRun, recordRun } from "@/lib/runs/record-run"
import { recordRunInputSchema } from "@/lib/runs/schemas"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const createRunAction = authActionClient
  .inputSchema(
    z.object({ values: recordRunInputSchema, publish: z.boolean() }),
  )
  .action(async ({ parsedInput: { values, publish }, ctx: { user } }) => {
    if (await findDuplicateRun(user.id, values)) {
      return { error: "Une course quasi identique existe déjà à cette date." }
    }
    const { run } = await recordRun(values, {
      userId: user.id,
      userName: user.name,
      source: RunSource.MANUAL,
      notify: publish,
    })
    return { runId: run.id }
  })
```

(Le `Date` traverse la frontière Server Action : React le sérialise. Si ce n'est pas le cas en
pratique, passer `date: z.coerce.date()` dans `recordRunInputSchema`.)

- [ ] **Step 4 : `update-run-action.ts`** — input `{ id: z.string(), values: recordRunInputSchema }`.
Charger la course (`where: { id, userId }`, sinon `{ error: "Course introuvable." }`).
Si `source === "STRAVA"` : ne mettre à jour que `name` et `date`. Sinon : mettre à jour tous les
champs scalaires + `pace` recalculé ; si `values.splits` non vide, remplacer les splits
(`deleteMany` + `createMany`, dans une transaction). Doublon via
`findDuplicateRun(user.id, values, id)`. Puis `recalculatePersonalRecords(user.id)`.
Retourne `{ runId: id }`.

- [ ] **Step 5 : `parse-track-action.ts`**

```ts
"use server"

import { z } from "zod"
import { parseTrackFile } from "@/lib/runs/track/parse-track"
import { TrackParseError } from "@/lib/runs/track/types"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

const MAX_BYTES = 15 * 1024 * 1024

export const parseTrackAction = authActionClient
  .inputSchema(
    z.object({
      file: z
        .instanceof(File)
        .refine((f) => f.size <= MAX_BYTES, "Fichier trop lourd (15 Mo max)."),
    }),
  )
  .action(async ({ parsedInput: { file } }) => {
    try {
      const summary = await parseTrackFile(
        file.name,
        new Uint8Array(await file.arrayBuffer()),
      )
      return { summary: { ...summary, date: summary.date.toISOString() } }
    } catch (err) {
      if (err instanceof TrackParseError) return { error: err.message }
      throw err
    }
  })
```

- [ ] **Step 6 :** `pnpm test && pnpm typecheck && pnpm knip`.
**Commit** `feat: add run form schema and create, update, parse-track actions`

---

### Task 7 : Pages `/runs/new` et `/runs/[id]/edit`

**Files :** créer `src/app/(app)/runs/_components/run-form.tsx`,
`src/app/(app)/runs/_components/track-dropzone.tsx`, `src/app/(app)/runs/new/page.tsx`,
`src/app/(app)/runs/[id]/edit/page.tsx` ; modifier `src/app/(app)/runs/[id]/page.tsx`,
`src/components/layout/page-header.tsx`.

**Interfaces :** Consumes : `runFormSchema`, `runFormToInput`, `createRunAction`,
`updateRunAction`, `parseTrackAction`, `formatRunPace`, `computePace`.

`RunForm` (client) :

```ts
type RunFormProps =
  | { mode: "create" }
  | { mode: "edit"; runId: string; source: RunSource; defaultValues: RunFormInput }
```

Comportements :
- **Création** : `Tabs` « Saisie manuelle » / « Importer un fichier ». L'onglet import affiche
  `TrackDropzone` ; au succès, il remplit le formulaire (`form.reset({...})` avec date/heure
  locales, distance en km à 2 décimales, h/m/s, D+, FC, cadence, calories, nom, type,
  `track`) puis bascule sur l'onglet saisie avec un bandeau « Données importées de
  <fichier> — vérifie avant d'enregistrer » et un bouton « Retirer le tracé » (`track: null`).
- Champs : Nom (placeholder = `defaultRunName` de la date saisie), Type (`Select` : Route /
  Trail / Tapis), Date (`input type="date"`, `max` = aujourd'hui), Heure (`type="time"`),
  Distance km (`inputMode="decimal"`, accepte la virgule → remplacer `,` par `.` dans
  `onChange`), Durée (3 inputs h / min / s alignés), section repliable « Plus de détails »
  (D+, FC moy, FC max, cadence, calories), `Switch` « Publier sur Discord » (création seulement,
  défaut activé).
- **Allure en direct** sous la durée : `formatRunPace(computePace(distance, durée))`, affichée
  seulement si les deux sont > 0.
- **Édition d'une course Strava** : tous les champs sauf Nom, Date, Heure sont `disabled`, avec
  une note « Course importée de Strava : seuls le nom et la date sont modifiables. »
- Soumission : `useAction` ; si `data.error` → `toast.error(data.error)` ; sinon
  `toast.success("Course enregistrée.")` et `router.push(runRoute(data.runId))`.
  Bouton `LoadingButton` « Enregistrer ».

`TrackDropzone` (client) : zone cliquable + glisser-déposer, `accept=".gpx,.fit"`, un seul
fichier ; refuse côté client > 15 Mo ; appelle `parseTrackAction` avec
`{ file }` ; état de chargement « Analyse du fichier… » ; erreurs en `toast.error`. Prop
`onParsed(summary, fileName)`. Texte d'aide : « Exporte le fichier depuis Garmin Connect,
Coros, Suunto ou Apple Santé (via une app d'export). »

Pages :
- `runs/new/page.tsx` (server) : `await getRequiredUser()` ; rend
  `<div className="p-4"><RunForm mode="create" /></div>` ; `metadata.title = "Ajouter une course"`.
- `runs/[id]/edit/page.tsx` (server) : charge la course (`prisma.run.findUnique` avec
  `userId: user.id`, sinon `notFound()`) ; construit `defaultValues` (date/heure au format
  `yyyy-MM-dd` / `HH:mm` via `date-fns` `format`, distance en km, h/m/s) ; rend
  `<RunForm mode="edit" … />`.
- `runs/[id]/page.tsx` : dans la barre propriétaire, avant `DeleteRunButton`, un
  `Button variant="ghost" size="sm" asChild` → `<Link href={editRunRoute(run.id)}>Modifier</Link>`.
- `page-header.tsx` : `isRunDetailPage` devient `/^\/runs\/[^/]+(\/edit)?$/` (flèche retour aussi
  sur `/runs/new` et l'édition).

- [ ] **Step 1 :** écrire les quatre fichiers et les deux modifications ci-dessus.
- [ ] **Step 2 : vérifier en vrai** — `pnpm dev`, se connecter, puis :
  1. `/runs/new` : saisir 10,5 km / 0 h 52 min 30 s → allure « 5'00" » affichée ; enregistrer →
     redirection vers la course, badge « Manuel », record 10 km absent (10,5 km > 105 %).
  2. Saisir 5,05 km → record 5 km créé (visible sur le profil).
  3. Resaisir la même course → toast « Une course quasi identique existe déjà ».
  4. Importer un `.gpx` réel → formulaire pré-rempli, enregistrer → splits et graphique visibles.
  5. Modifier la course → changement visible ; supprimer → records recalculés.
  6. Date demain → erreur « La date ne peut pas être dans le futur. »
- [ ] **Step 3 :** `pnpm lint && pnpm typecheck && pnpm test && pnpm knip`.
**Commit** `feat: add manual run entry and gpx/fit import pages`

---

### Task 8 : Points d'entrée « Ajouter une course »

**Files :** `src/components/layout/app-sidebar/app-sidebar-nav.tsx` (ou `index.tsx` selon où
vit le bloc de navigation desktop).

- [ ] **Step 1 : desktop** — sous la liste `NAV_ITEMS` de `AppSidebarNav`, un bouton plein
`Button size="lg" asChild className="mt-2 w-full justify-center lg:justify-start"` →
`<Link href={ROUTES.RUN_NEW}><Plus size={20} /><span className="hidden lg:inline">Ajouter une course</span></Link>`.
- [ ] **Step 2 : mobile** — dans `MobileNav`, un bouton flottant rond
`fixed right-4 bottom-20 z-50 size-14 rounded-full shadow-lg md:hidden` (au-dessus de la barre),
`aria-label="Ajouter une course"`, icône `Plus`, masqué quand `pathname === ROUTES.RUN_NEW`
ou commence par `/runs/` et finit par `/edit`.
- [ ] **Step 3 :** vérifier dans `pnpm dev` en largeur desktop et mobile (DevTools 390 px).
**Commit** `feat: add run entry points in sidebar and mobile fab`

---

### Task 9 : Documentation

**Files :** créer `src/lib/runs/CLAUDE.md` ; modifier `src/lib/strava/CLAUDE.md`, `CLAUDE.md`
racine (ligne Strava + ligne « Runs » dans Tech Stack + route API `gpx` inexistante retirée),
`src/lib/discord/CLAUDE.md` (appelé depuis `recordRun`).

`src/lib/runs/CLAUDE.md` doit documenter : `recordRun` comme **seul** chemin d'écriture d'une
course, `removeRun` comme seul chemin de suppression, `findDuplicateRun`, les schémas et leurs
bornes, la règle des records sans splits, le module `track/` (formats, constantes de pause /
hystérésis / sous-échantillonnage) et le fait que les données Strava contournent
`recordRunInputSchema`.

- [ ] **Step 1 :** écrire / modifier.
- [ ] **Step 2 : vérification finale** — `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm knip && pnpm build`.
**Commit** `docs: document runs module and strava flag`
