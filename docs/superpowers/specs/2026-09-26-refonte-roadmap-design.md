# Refonte Run Together — feuille de route

Date : 26 septembre 2026
Statut : proposition, à valider

## Contexte

L'application Strava est passée en statut `Inactive` (19 août 2026) et l'API n'est plus
accessible sans payer. Conséquences directes :

- plus aucune course n'entre dans l'app (le seul chemin de création est `importStravaActivity`) ;
- plus aucune notification Discord (`sendRunNotification` n'est appelée que depuis ce pipeline) ;
- les cartes dépendent d'un token Mapbox (`NEXT_PUBLIC_MAPBOX_TOKEN`) pour des images statiques.

L'objectif est de rendre l'app autonome vis-à-vis de Strava, de remettre les notifications
Discord au centre, de moderniser l'outillage du dépôt sur le modèle de `better-list`, puis de
retravailler l'UI/UX et d'ajouter les badges.

## Découpage et ordre

Chaque phase = une branche + une PR + son propre plan d'implémentation (`docs/superpowers/plans/`).

| #   | Phase                                                          | Pourquoi à cette place                                                                            |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Fondations du dépôt + config Claude Code + diagnostic de santé | Tous les diffs suivants passent par Biome/lefthook/knip ; le diagnostic sort des outils installés |
| 2   | Courses sans Strava (formulaire + import GPX/FIT)              | Débloque la production de données                                                                 |
| 3   | Notifications Discord v2                                       | Point le plus important ; dépend des courses de la phase 2                                        |
| 4   | Audit des features et de leur disposition dans les pages       | Entrée de la phase 5, fait sur l'app déjà débloquée                                               |
| 5   | Refonte UI/UX + cartes shadcn-map                              | Pilotée par l'audit                                                                               |
| 6   | Badges                                                         | Réutilise le pipeline de la phase 2 et les notifs de la phase 3                                   |

---

## Phase 1 — Fondations du dépôt et config Claude Code

### Outillage

| Aujourd'hui                              | Cible                                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint 9 + `eslint-config-next`          | **Biome 2** (`biome.json` calqué sur better-list : domaines `next` + `react`, `organizeImports`, directives Tailwind, override `src/components/shadcn-ui/**`)         |
| Prettier + `prettier-plugin-tailwindcss` | Formatter Biome (tri des classes via la règle `useSortedClasses`)                                                                                                     |
| husky + lint-staged                      | **lefthook** : `pre-commit` = `biome check --write` sur les fichiers indexés (`stage_fixed`) ; `commit-msg` = commitlint ; `pre-push` = `typecheck` + `test` + `knip` |
| —                                        | **knip** (`knip.jsonc`) : ignore `src/generated/`, `src/components/shadcn-ui/`, entrées `scripts/*.ts` et `.claude/hooks/*.mjs`                                       |
| —                                        | **`.nvmrc`** (`24`), `packageManager: pnpm@11.x`, `engines.node`                                                                                                      |
| —                                        | **Vitest** (`vitest.config.mts`), premiers tests sur les fonctions pures : `personal-records`, formatters de `lib/utils/run.ts`, futur parseur GPX                    |
| `pnpm-workspace.yaml` avec placeholders  | `allowBuilds` rempli : `@prisma/engines`, `prisma`, `esbuild`, `sharp` → `true` ; `unrs-resolver` disparaît avec ESLint ; `msw` → `false`                             |

Scripts : `lint` = `biome check`, `format` = `biome format --write`, `typecheck` =
`next typegen && tsc --noEmit`, `knip`, `test`, `test:watch`. Les scripts `db:*` et
`scripts/*.ts` restent.

Les `eslint-disable` existants sont convertis en `biome-ignore` ou supprimés si la règle
n'existe pas côté Biome.

### Montée de versions

Aligner sur better-list : Next 16.3, React 19.2.8, Prisma 7.10, better-auth 1.7, next-safe-action
8.7, lucide, recharts, zod 4.5, `@types/node` 24. **React Compiler** activé
(`babel-plugin-react-compiler`), à valider au build. Montée faite dans un commit séparé
de la bascule d'outillage pour pouvoir la reverter seule.

### CI GitHub Actions

`ci.yml` : Node lu depuis `.nvmrc`, pnpm depuis `packageManager`. Jobs : `biome ci`, `typecheck`,
`knip`, `test`, `build`. Les secrets restent ceux actuels (+ ceux ajoutés par les phases
suivantes).

### Config Claude Code (`.claude/`)

- **`settings.json`** : allowlist de permissions (pnpm lint/format/typecheck/knip/test/build,
  `pnpm exec biome|knip|lefthook|tsc`, `pnpm dlx shadcn`, `pnpm prisma`, git en lecture, `gh pr/run`
  en lecture), plugins activés (prisma, context7, superpowers, playwright).
- **Hooks** (Node `.mjs`, portables Windows — remplacent l'actuel `python3 … && pnpm lint` qui lint
  tout le projet à chaque édition) :
  - `PostToolUse` → `biome-format.mjs` : `biome check --write` sur le seul fichier modifié ;
  - `PreToolUse` → `conventions-guard.mjs` : refus déterministe (exit 2) de
    `process.env` hors `src/env.ts` / configs / `scripts/` / `prisma/seed.ts`,
    `new PrismaClient` hors `src/lib/db/` et `scripts/`,
    import de `@hookform/resolvers/zod`, `z.string().email()`.
- **Agents** : `convention-reviewer` (relit un diff contre les `CLAUDE.md` du projet),
  `next-docs` (répond depuis `node_modules/next/dist/docs/`).
- **Skills** : les trois skills projet existantes (`form`, `new-component`, `new-route`) mises à
  jour pour Biome ; copies figées de skills externes utiles au repo : `better-auth-best-practices`,
  `better-auth-security-best-practices`, `prisma-cli`, `prisma-client-api`, `upfetch`, `shadcn`,
  `vercel-react-best-practices`, `web-design-guidelines`, `ui-ux-pro-max`,
  `playwright-best-practices`. Provenance et date de copie tracées dans **`.claude/SKILLS.md`**
  (modèle better-list).
- **CLAUDE.md** : mis à jour (scripts, Biome/lefthook, section « Strava inactif »).

### Diagnostic de santé (livrable de fin de phase)

Rapport `docs/audit/2026-09-health.md` produit après la bascule : résultat de `typecheck`,
`biome ci`, `knip` (code/deps morts), `pnpm outdated`, `pnpm audit`, build, et une passe
sécurité ciblée (tokens Strava stockés en clair, vérification du webhook, actions admin,
routes API publiques `og`/`gpx`). Les corrections triviales sont faites dans la phase ; le reste
alimente la phase 4.

---

## Phase 2 — Courses sans Strava

### 2a. Pipeline indépendant de la source (refactor préalable)

Aujourd'hui création de run, records perso et notification sont soudés dans
`lib/strava/import-activity.ts`. On extrait un pipeline commun dans **`src/lib/runs/`** :

```
src/lib/runs/
├── record-run.ts          # recordRun(input) : transaction Run+Splits → PR → événements (notifs, badges)
├── personal-records.ts    # déplacé depuis lib/strava/
├── pr-display.ts          # déplacé depuis lib/strava/
├── pace.ts                # computePace, splits depuis points GPS
└── schemas.ts             # runInputSchema partagé (form + GPX + Strava)
```

`importStravaActivity` devient un simple mapper Strava → `recordRun()`. Le code Strava est
conservé (réactivable si l'API revient) mais son UI est masquée derrière un flag
`STRAVA_ENABLED` (env, défaut `false`).

**Records perso sans splits** : une course manuelle n'a pas de splits. `extractCandidates` est
étendu : sans splits, la course entière compte pour 1 km / 5 km / 10 km si sa distance est dans
`[97 % ; 105 %]` de la cible (même tolérance que semi/marathon aujourd'hui).

### 2b. Saisie manuelle via formulaire

- Route : **`/runs/new`** (constante `ROUTES.RUN_NEW`), accessible par un bouton « Ajouter une
  course » dans la sidebar et un FAB sur mobile.
- Formulaire (React Hook Form + `standardSchemaResolver`, messages FR) :
  - obligatoires : **date + heure**, **distance** (km, décimales), **durée** (h / min / s) ;
  - optionnels : nom (défaut « Course du matin/midi/soir » selon l'heure), type
    (Route / Trail / Tapis → `sportType`), D+, FC moyenne, FC max, cadence, calories ;
  - allure calculée et affichée en direct (`formatRunPace`) ;
  - case **« Publier sur Discord »** cochée par défaut.
- Validation : distance 0,1–300 km, allure entre 2'00" et 20'00"/km, date ≤ maintenant.
- Action : `createManualRunAction` (auth-action-client) → `recordRun({ source: "MANUAL", … })`
  → redirection vers `runRoute(id)` + toast.
- **Édition / suppression** d'une course manuelle par son propriétaire (`/runs/[id]/edit`,
  même formulaire) ; suppression → `recalculatePersonalRecords` (existant). Les courses Strava
  historiques restent éditables sur nom/date uniquement.

### 2c. Import de fichier GPX / FIT

- Dans le même écran `/runs/new`, onglet **« Importer un fichier »** (glisser-déposer, 1 fichier,
  `.gpx` ou `.fit`, ≤ 15 Mo).
- Parsing **côté serveur** dans une Server Action : GPX via un parseur XML léger, FIT via une
  bibliothèque de décodage FIT (choix exact à trancher dans le plan de la phase, critère :
  maintenue, sans dépendance native).
- Dérivés calculés depuis les points : distance (haversine), temps en mouvement (pauses
  > 10 s à < 0,5 m/s exclues), D+ lissé, splits au km, FC moy/max si présente, cadence,
  > `polyline` + `summaryPolyline` (encodage Google polyline, point de départ).
- Le résultat **pré-remplit le formulaire** (l'utilisateur relit, corrige le nom, décoche
  Discord) avant l'enregistrement. Le fichier n'est pas stocké.
- Anti-doublon : refus si une course du même utilisateur existe à ± 2 min avec ± 2 % de distance.
- Tests Vitest sur le parseur avec des fixtures GPX/FIT réelles (Garmin, Coros, Apple).

---

## Phase 3 — Notifications Discord v2

Retenu par défaut (non tranché explicitement) : \*\*embed riche + nouveaux événements + fiabilité

- récap hebdo\*\*. Hors périmètre : bot Discord interactif.

### Événements

| Événement        | Déclencheur                        | Contenu                                                                                                                                                    |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run.created`    | `recordRun` (si « Publier » coché) | Embed riche : distance, durée, allure, D+, FC ; image OG ; **record(s) battu(s) en champ dédié** avec l'ancien temps (pas de message séparé → pas de spam) |
| `member.joined`  | fin d'onboarding                   | Message de bienvenue                                                                                                                                       |
| `badge.unlocked` | phase 6                            | Badge + course associée                                                                                                                                    |
| `recap.weekly`   | cron lundi 8 h (Europe/Paris)      | Top distance / nb de courses / meilleure allure de la semaine, total km du groupe, records de la semaine                                                   |

### Architecture

```
src/lib/discord/
├── client.ts        # discordFetch + gestion 429 (retry_after) et 5xx (2 retries)
├── embeds/          # un builder pur par événement (testables sans réseau)
├── notify.ts        # notify(event) : dédoublonnage → envoi → journal
└── CLAUDE.md
```

- Nouveau modèle **`DiscordNotification`** : `id`, `type`, `dedupeKey` (unique — ex.
  `run.created:<runId>`), `status` (`SENT` | `FAILED` | `SKIPPED`), `error`, `payload` (JSON),
  `createdAt`, `sentAt`. Un envoi déjà `SENT` pour la même clé n'est jamais renvoyé.
- L'envoi ne bloque jamais la création d'une course (erreur journalisée, statut `FAILED`).
- Préférence utilisateur **« Publier mes courses sur Discord »** (défaut oui) dans `/settings`,
  surchargée course par course par la case du formulaire.
- **Admin** : onglet « Discord » — historique filtrable, bouton **Renvoyer** sur un `FAILED`,
  bouton **Tester le webhook**.
- Récap hebdo : route `GET /api/cron/weekly-recap` protégée par `CRON_SECRET`, déclarée dans
  `vercel.json` (`crons`). Nouvelles variables : `CRON_SECRET` (server).
- L'image OG (`/api/og/run/[runId]`) est vérifiée/adaptée pour les courses **sans tracé**
  (rendu stats seules).
- Le script `scripts/send-run-to-discord.ts` passe par `notify()` au lieu de dupliquer l'embed.

---

## Phase 4 — Audit des features et de la disposition des pages

Livrable : `docs/audit/features-pages.md`, produit en naviguant l'app (Playwright,
desktop + mobile) et en lisant les routes.

Pour chaque page (`home`, `runs`, `runs/[id]`, `progress`, `leaderboard`, `compare`,
`profile/[username]`, `settings`, `badges`, `admin`, `onboarding`, auth) **et** son
`@rightPanel` :

- inventaire des features présentes et de leur emplacement (colonne centrale vs panneau droit
  vs navigation mobile) ;
- doublons entre pages, features orphelines ou mortes (ex. tout le parcours Strava) ;
- hiérarchie de l'information, états vides / chargement / erreur, accessibilité
  (`web-design-guidelines`), comportement mobile (le panneau droit disparaît-il ? où vont ses
  infos ?) ;
- recommandations priorisées (P1/P2/P3) → backlog de la phase 5.

---

## Phase 5 — Refonte UI/UX + cartes

Périmètre définitif fixé par l'audit. Invariants déjà décidés :

- **shadcn-map** (Leaflet / React Leaflet, tuiles gratuites OSM/CARTO, clair/sombre) remplace
  Mapbox : carte **interactive** sur `runs/[id]` (tracé, départ/arrivée, marqueurs km),
  **carte de toutes mes courses** sur le profil. Leaflet chargé en `dynamic(..., { ssr: false })`.
- Dans le feed, la miniature devient un **SVG du tracé** généré depuis `summaryPolyline`
  (pas de tuiles, pas de token, léger). → suppression de `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Point d'entrée « Ajouter une course » visible partout (sidebar + FAB mobile).
- Skeletons et états vides systématiques ; revue de la navigation mobile.
- Direction visuelle proposée via `ui-ux-pro-max` au début de la phase, validée avant
  implémentation.

---

## Phase 6 — Badges

- **Catalogue en code** (`src/lib/badges/catalog.ts`) : clé, nom, description, icône, catégorie,
  fonction d'évaluation pure. Pas de table de définitions.
- Table **`UserBadge`** : `userId`, `badgeKey`, `unlockedAt`, `runId?` ; unique
  `(userId, badgeKey)`.
- Catégories initiales :
  - **cumul** : 50 / 100 / 500 / 1 000 km ; 10 / 50 / 100 courses ; 1 000 / 5 000 m D+ ;
  - **distance** : premier 5 km, 10 km, semi, marathon ;
  - **régularité** : 4 / 12 / 52 semaines consécutives avec ≥ 1 course ; objectif hebdo tenu ;
  - **moments** : lève-tôt (départ avant 7 h), noctambule (après 21 h), course le 1er janvier ;
  - **records** : premier record perso, 5 records battus.
- Évaluation dans `recordRun()` après les records perso ; retrait possible après suppression
  d'une course (réévaluation complète). Script `db:backfill-badges` pour l'historique.
- Page `/badges` (sortie du `notFound()` en prod) : grille débloqués / verrouillés avec
  progression ; badges récents sur le profil ; notification Discord `badge.unlocked`.

---

## Décisions prises par défaut (à confirmer ou corriger)

1. Ordre des phases ci-dessus (Discord en 3 car il dépend des courses de la phase 2).
2. Discord : A + B + C + D retenus, E (bot) exclu.
3. UI Strava masquée derrière `STRAVA_ENABLED=false`, code conservé.
4. Records perso des courses manuelles : course entière, tolérance 97–105 %.
5. Fichiers GPX/FIT non stockés après import.
6. Mapbox abandonné au profit de shadcn-map + SVG.
