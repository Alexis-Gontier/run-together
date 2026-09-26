# Phase 6 — Badges : plan d'implémentation

> superpowers:executing-plans (inline).

**Goal :** des badges calculés à partir des courses, débloqués automatiquement, visibles sur
`/badges` et le profil, annoncés sur Discord.

**Architecture :** catalogue en code (`src/lib/badges/catalog.ts`) ; statistiques pures
calculées depuis la liste des courses (`stats.ts`, testé) ; `evaluateBadges(userId)` fait le
diff entre ce que le catalogue accorde et la table `UserBadge` (ajoute / retire) et renvoie les
nouveaux. Appelé par `recordRun` (avec notification), `removeRun` et l'édition (sans).

## Décisions

- Pas de table de définitions : un badge = une clé du catalogue. `UserBadge` (userId, badgeKey,
  unlockedAt, runId?) unique par (userId, badgeKey).
- Un badge peut être **retiré** si la course qui le justifiait est supprimée (réévaluation).
- Heures locales en `Europe/Paris` (lève-tôt / noctambule / 1er janvier).
- Distances « premier 5 km / 10 km / semi / marathon » : même tolérance que les records (97 %).
- Notification Discord : un seul message par course, listant tous les badges débloqués,
  `dedupeKey` `badge.unlocked:{runId}`.
- Rattrapage de l'historique : bouton admin « Recalculer les badges » (sans notification) plutôt
  qu'un script, qui pointerait la base de production via `.env`.
- Navigation : entrée « Badges » en desktop ; en mobile, onglet Badges du profil.

## Catalogue initial (20)

| Catégorie | Badges |
| --- | --- |
| Distance cumulée | 50 km, 100 km, 500 km, 1 000 km |
| Nombre de courses | 10, 50, 100 |
| Dénivelé cumulé | 1 000 m, 5 000 m |
| Distance d'une course | premier 5 km, 10 km, semi, marathon |
| Régularité | 4, 12, 52 semaines consécutives |
| Moments | lève-tôt (< 7 h), noctambule (≥ 21 h), 1er janvier |
| Records | premier record, records sur 4 distances |

## Tasks

1. Schéma `UserBadge` + migration (branche dev).
2. `lib/badges/{catalog,stats,evaluate}.ts` + tests (stats, semaines consécutives, catalogue).
3. Branchement `recordRun` / `removeRun` / `update-run-action` ; embed `badge.unlocked` +
   `notifyBadgesUnlocked`.
4. Page `/badges` (catalogue par catégorie, débloqués en couleur + date, verrouillés en gris +
   progression), onglet Badges du profil, carte « Derniers badges » dans le panneau du profil,
   entrée de navigation desktop.
5. Admin : bouton « Recalculer les badges ». Docs (`src/lib/badges/CLAUDE.md`, CLAUDE.md).
