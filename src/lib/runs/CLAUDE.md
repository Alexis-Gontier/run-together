# Runs Library — création, suppression, records, traces

Indépendant de la source : formulaire, fichier GPX/FIT et Strava passent tous par ici.

## Files

| File                  | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `record-run.ts`       | `recordRun()`, `removeRun()`, `findDuplicateRun()`, `findNearbyRun()`   |
| `schemas.ts`          | `recordRunInputSchema`, `trackDataSchema`, `RUN_SPORT_TYPES`            |
| `pace.ts`             | `computePace(m, s)` → s/km, `defaultRunName(date)`                      |
| `personal-records.ts` | `extractCandidates`, `updatePersonalRecords`, `recalculatePersonalRecords` |
| `pr-display.ts`       | `PR_DISTANCE_LABELS`, `PR_DISTANCE_ORDER` (importable côté client)      |
| `track/`              | Parsing GPX / TCX / FIT (+ `.gz`) → `TrackSummary`                           |
| `track/summary-to-input.ts` | `trackSummaryToRunInput` — résumé → `RecordRunInput` (import en masse) |

## Règles

- **`recordRun(input, options)` est le seul chemin de création d'une course.** Transaction
  Run + Splits → records perso → notification Discord (si `notify`). Les étapes après la
  transaction loggent leurs erreurs et ne font jamais échouer l'enregistrement.
- **`removeRun(userId, runId)` est le seul chemin de suppression** : il recalcule les records
  (la course en portait peut-être). Une mise à jour de distance/durée recalcule aussi.
- `findDuplicateRun` : même user, départ ±2 min, distance ±2 % → refus côté action.
- Bornes de `recordRunInputSchema` : 0,1–300 km, allure 2'00"–20'00"/km, date ≤ maintenant.
  **Les données Strava ne passent pas par ce schéma** (`stravaActivityToRunInput`) : l'historique
  peut sortir des bornes et doit rester importable.
- Records perso : fenêtre glissante sur les splits pour 1/5/10 km ; **sans splits**, la course
  entière compte si sa distance est dans [97 % ; 105 %] de la cible. Semi/marathon : course
  entière ≥ 97 %.

## `track/`

`parseTrackFile(fileName, bytes)` → `parseGpx` / `parseTcx` (`fast-xml-parser`) ou `parseFit`
(`@garmin/fitsdk`) → `summarizeTrack`. Erreurs attendues : `TrackParseError` (message FR montré
tel quel).

- Pause : segment < 0,5 m/s, ou > 30 s pour < 10 m. Exclue du temps **et** de la distance.
- D+ : hystérésis de 3 m.
- Splits interpolés au kilomètre (durée, FC, dénivelé net) ; dernier split gardé s'il fait ≥ 50 m.
- Distance cumulée de l'appareil (FIT `distance`) préférée au GPS quand elle existe.
- `summaryPolyline` = tracé sous-échantillonné à ≤ 200 points (miniatures).
- `.gz` décompressé avant parsing (archive Strava : `activities/*.fit.gz`).
- FIT Amazfit : deux records par seconde (position / distance) fusionnés ; une distance répétée
  (rafraîchie toutes les 2-3 s) n'est pas prise pour une pause.
- Import en masse (`/runs/new`, onglet « Plusieurs fichiers ») : `importTrackFileAction`, un
  appel par fichier, `recordRunInputSchema` + `findDuplicateRun` (doublon = ignoré), `notify: false`.
  Avec `activities.csv` de l'archive Strava (`_utils/strava-archive.ts`, en-têtes EN/FR) : autres
  sports écartés côté client, titre et type Strava transmis à l'action.
  Départ à ±30 min d'une course existante (`findNearbyRun`, distance libre) → « à confirmer »,
  enregistrée seulement avec `force`. `recordRun(…, { skipBadges: true })` puis
  `evaluateMyBadgesAction` une fois en fin d'import.
- `NotARunError` (sous-classe de `TrackParseError`) : fichier lisible mais autre sport → « ignorée »
  en masse. GPX : type explicite non-course (vélo, marche…) refusé ; type absent/inconnu = course.
- Les fichiers ne sont jamais stockés. Limite 15 Mo (`serverActions.bodySizeLimit` = 16 Mo).
