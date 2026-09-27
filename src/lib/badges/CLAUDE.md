# Badges Library

## Files

| File          | Purpose                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `catalog.ts`  | `BADGES` (définitions), `BADGE_CATEGORIES`, `earnedBadges`, `badgeProgress` |
| `stats.ts`    | `computeBadgeStats(runs, recordDistances)` — pur, testé                     |
| `evaluate.ts` | `evaluateBadges`, `getBadgeStatuses`, `getUnlockedBadges`                   |

## Rules

- **Les définitions vivent dans le code.** `UserBadge` ne stocke que (userId, badgeKey,
  unlockedAt, runId?). Ajouter un badge = ajouter une entrée au catalogue avec une clé
  **stable** (la renommer fait perdre le badge à tout le monde).
- `evaluateBadges(userId, runId?)` aligne la table sur le catalogue : ajoute ce qui est gagné,
  **retire** ce qui ne l'est plus (course supprimée ou modifiée). Renvoie les nouveaux.
- Appelé par `recordRun` (après les records : deux badges dépendent du nombre de records),
  `removeRun` et `updateRunAction`. Import en masse : `recordRun` avec `skipBadges`, puis
  `evaluateMyBadgesAction` une seule fois à la fin (sans `runId`, sans notification). Notification Discord uniquement depuis `recordRun` quand
  `notify` est vrai : un message par course (`badge.unlocked:{runId}`).
- Heures locales en `Europe/Paris` ; semaines consécutives calculées en semaines locales.
- Badges « sur une course » : tolérance GPS de 97 %, comme les records perso.
- Badges collectifs (catégorie « Ensemble ») : seuils sur le total du groupe, accordés aux
  seuls membres qui ont au moins une course. Ils se débloquent pour tous lors de la prochaine
  évaluation de chacun (ou du recalcul admin).
- Rattrapage de l'historique : bouton admin « Recalculer les badges » (aucune notification).

## UI

`/badges` (catalogue + progression), `BadgeMedal` (`src/components/ui/badge-medal.tsx`, une
teinte par catégorie), `RecentBadgesCard` (panneau du profil, et sous l'en-tête en mobile).
