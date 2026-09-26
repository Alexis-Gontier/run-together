# Phase 1 — Fondations du dépôt : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** remplacer ESLint/Prettier/husky/lint-staged par Biome/lefthook/knip/Vitest, monter les
dépendances, moderniser la CI et installer une config Claude Code versionnée, puis produire un
rapport de santé de l'app.

**Architecture :** changement d'outillage uniquement — aucun comportement applicatif ne change,
hors montée de versions. Chaque bascule d'outil est un commit isolé ; le reformatage de masse
est un commit `style:` séparé, référencé dans `.git-blame-ignore-revs`.

**Tech Stack :** Biome 2, lefthook 2, knip 6, Vitest 4, Node 24, pnpm 11, Next 16.3, Prisma 7.10.

**Spec :** `docs/superpowers/specs/2026-09-26-refonte-roadmap-design.md` (section « Phase 1 »)

**Modèle de référence :** `C:\Users\alexi\Desktop\dev\better-list` — ses fichiers
`biome.json`, `lefthook.yml`, `knip.jsonc`, `vitest.config.mts`, `.github/workflows/ci.yml`,
`.claude/` sont l'étalon. S'y reporter en cas de doute.

## Global Constraints

- Branche de travail : `dev`. Aucun push, aucune PR sans demande explicite.
- Style de code **inchangé** : pas de point-virgule, guillemets doubles, virgules finales
  partout, 2 espaces, largeur 80. Biome doit reproduire le style Prettier actuel.
- Commits conventionnels (`feat | fix | chore | refactor | docs | style | test | perf | ci`),
  terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ne jamais lire `process.env` hors `src/env.ts`, configs racine, `scripts/`, `prisma/seed.ts`.
- Node `24` (`.nvmrc`), pnpm `11.27.1` (`packageManager`).
- Le shell est Git Bash sous Windows : chemins POSIX, pas de `python3`.

---

## Carte des fichiers

| Fichier                                                       | Action    | Rôle                                            |
| ------------------------------------------------------------- | --------- | ----------------------------------------------- |
| `.gitattributes`                                              | créer     | fins de ligne LF                                |
| `.nvmrc`                                                      | créer     | version Node                                    |
| `package.json`                                                | modifier  | `packageManager`, `engines`, scripts, deps      |
| `pnpm-workspace.yaml`                                         | modifier  | `allowBuilds` (lefthook, retrait unrs-resolver) |
| `biome.json`                                                  | créer     | lint + format                                   |
| `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore` | supprimer | remplacés par Biome                             |
| `.git-blame-ignore-revs`                                      | créer     | masque le commit de reformatage                 |
| `lefthook.yml`                                                | créer     | hooks git                                       |
| `.husky/`                                                     | supprimer | remplacé par lefthook                           |
| `vitest.config.mts`                                           | créer     | tests unitaires                                 |
| `src/lib/utils/run.test.ts`                                   | créer     | premiers tests                                  |
| `knip.jsonc`                                                  | créer     | code et deps morts                              |
| `next.config.ts`                                              | modifier  | React Compiler                                  |
| `.github/workflows/ci.yml`                                    | réécrire  | CI unifiée                                      |
| `.claude/settings.json`                                       | réécrire  | permissions, hooks, plugins                     |
| `.claude/hooks/biome-format.mjs`                              | créer     | format après écriture                           |
| `.claude/hooks/conventions-guard.mjs`                         | créer     | refus des violations déterministes              |
| `.claude/agents/convention-reviewer.md`                       | créer     | relecture de diff vs CLAUDE.md                  |
| `.claude/agents/next-docs.md`                                 | créer     | réponses Next depuis la doc embarquée           |
| `.claude/skills/*`                                            | copier    | skills externes figées                          |
| `.claude/SKILLS.md`                                           | créer     | provenance des skills                           |
| `CLAUDE.md`                                                   | modifier  | scripts et outillage                            |
| `docs/audit/2026-09-health.md`                                | créer     | rapport de santé                                |

---

### Task 1 : Socle Node / pnpm / fins de ligne

**Files :**

- Create : `.gitattributes`, `.nvmrc`
- Modify : `package.json`

**Interfaces :** Produces : `.nvmrc` = `24` (lu par la CI en Task 7) ; `packageManager` (lu par `pnpm/action-setup`).

- [ ] **Step 1 : créer `.gitattributes`**

```gitattributes
# Les fins de ligne se normalisent en LF dans le dépôt, quelle que soit la machine.
# Sans cette règle, git recheckout en CRLF sous Windows et Biome refuse le fichier.
* text=auto eol=lf

# Les binaires ne se convertissent jamais.
*.png  binary
*.jpg  binary
*.jpeg binary
*.webp binary
*.gif  binary
*.ico  binary
*.woff binary
*.woff2 binary
*.ttf  binary
*.pdf  binary
*.fit  binary
```

- [ ] **Step 2 : créer `.nvmrc`** contenant exactement `24` suivi d'un retour ligne.

- [ ] **Step 3 : modifier `package.json`** — ajouter après `"private": true,` :

```json
  "packageManager": "pnpm@11.27.1",
  "engines": {
    "node": ">=24"
  },
```

- [ ] **Step 4 : renormaliser et vérifier**

Run : `git add --renormalize . && git status --short`
Expected : seuls `.gitattributes`, `.nvmrc`, `package.json` (et éventuellement des fichiers
renormalisés) apparaissent. `pnpm install` doit se terminer par `Done`.

- [ ] **Step 5 : commit**

```bash
git add .gitattributes .nvmrc package.json
git commit -m "chore: pin node 24 and pnpm 11, normalize line endings"
```

---

### Task 2 : Biome remplace ESLint et Prettier

**Files :**

- Create : `biome.json`, `.git-blame-ignore-revs`
- Delete : `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`
- Modify : `package.json` (scripts, devDeps, retrait de `lint-staged` plus tard en Task 3),
  `pnpm-workspace.yaml`, `src/app/api/og/run/[runId]/route.tsx:143`,
  `src/components/ui/mapbox-polyline.tsx:14`

**Interfaces :** Produces : scripts `pnpm lint` (= `biome check`), `pnpm format`
(= `biome format --write`), binaire `node_modules/@biomejs/biome/bin/biome` (utilisé par le hook
Claude en Task 8 et par lefthook en Task 3).

- [ ] **Step 1 : installer Biome, retirer ESLint et Prettier**

```bash
pnpm add -D -E @biomejs/biome@2.5.11
pnpm remove eslint eslint-config-next prettier prettier-plugin-tailwindcss
git rm eslint.config.mjs prettier.config.mjs .prettierignore
```

- [ ] **Step 2 : retirer `unrs-resolver` de `pnpm-workspace.yaml`** (dépendance d'ESLint
      uniquement). Vérifier : `pnpm why unrs-resolver` ne renvoie plus rien ; sinon la laisser.

- [ ] **Step 3 : créer `biome.json`**

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": [
      "**",
      "!node_modules",
      "!.next",
      "!src/generated",
      "!pnpm-lock.yaml"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "double",
      "trailingCommas": "all"
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "nursery": {
        "useSortedClasses": {
          "level": "warn",
          "fix": "safe",
          "options": {
            "functions": ["clsx", "cn", "cva"]
          }
        }
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "overrides": [
    {
      "includes": ["src/components/shadcn-ui/**"],
      "linter": {
        "rules": {
          "a11y": {
            "useSemanticElements": "off",
            "useKeyWithClickEvents": "off"
          },
          "suspicious": {
            "noArrayIndexKey": "off"
          }
        }
      }
    }
  ]
}
```

Si `pnpm exec biome check biome.json` signale que `useSortedClasses` n'est plus en `nursery`,
lancer `pnpm exec biome explain useSortedClasses` et déplacer la règle dans le groupe indiqué.

- [ ] **Step 4 : scripts `package.json`** — remplacer `lint`, `format`, `format:check` par :

```json
    "lint": "biome check",
    "lint:fix": "biome check --write",
    "format": "biome format --write",
```

- [ ] **Step 5 : convertir les deux `eslint-disable`**

Dans `src/app/api/og/run/[runId]/route.tsx:143` et `src/components/ui/mapbox-polyline.tsx:14`,
remplacer :

```tsx
// eslint-disable-next-line @next/next/no-img-element
```

par (dans du JSX, la forme commentaire JSX `{/* ... */}` si la ligne est dans un arbre JSX) :

```tsx
// biome-ignore lint/performance/noImgElement: image générée (OG / carte statique), next/image inutile ici
```

- [ ] **Step 6 : commit de config (sans reformatage)**

```bash
git add biome.json package.json pnpm-lock.yaml pnpm-workspace.yaml src/app/api/og src/components/ui/mapbox-polyline.tsx
git commit --no-verify -m "chore: replace eslint and prettier with biome"
```

(`--no-verify` uniquement ici : le hook husky appelle encore `lint-staged`/`prettier`, supprimés.
Il disparaît en Task 3.)

- [ ] **Step 7 : reformatage de masse**

Run : `pnpm exec biome check --write .`
Puis : `pnpm lint`
Expected : 0 erreur. Pour chaque erreur restante non auto-corrigeable, corriger le code à la
main (pas de `biome-ignore` sauf justification écrite dans le commentaire). Relancer jusqu'à 0.
Contrôler que le diff n'est **que** du tri d'imports / de classes / de lint : `git diff --stat`
ne doit pas montrer de changement de guillemets ni de points-virgules (sinon la config
`javascript.formatter` du Step 3 est fausse — la corriger et recommencer).

- [ ] **Step 8 : commit du reformatage + blame-ignore**

```bash
git add -A
git commit --no-verify -m "style: apply biome formatting and import sorting"
git rev-parse HEAD > .git-blame-ignore-revs
git add .git-blame-ignore-revs
git commit --no-verify -m "chore: ignore biome reformat in git blame"
```

---

### Task 3 : lefthook remplace husky et lint-staged

**Files :**

- Create : `lefthook.yml`
- Delete : `.husky/`
- Modify : `package.json`, `pnpm-workspace.yaml`

**Interfaces :** Consumes : `pnpm lint` (Task 2). Produces : hooks `pre-commit`, `commit-msg`,
`pre-push` — le `pre-push` appelle `pnpm typecheck`, `pnpm test`, `pnpm knip`, définis en
Tasks 4 et 5 ; jusque-là ces jobs échouent, donc ne pas pousser avant la fin de la Task 5.

- [ ] **Step 1 : dépendances**

```bash
pnpm add -D lefthook
pnpm remove husky lint-staged
git rm -r .husky
```

Dans `package.json` : supprimer le script `"prepare": "husky"` et le bloc `"lint-staged"`.
Dans `pnpm-workspace.yaml`, ajouter sous `allowBuilds:` la ligne `  lefthook: true` (son
postinstall installe les hooks).

- [ ] **Step 2 : créer `lefthook.yml`**

```yaml
# Hooks Git — https://lefthook.dev/configuration/
#
# Installés par le postinstall du paquet npm : un `pnpm install` suffit après un clone.
# `pre-commit` ne fait que du formatage sur les fichiers indexés (rapide) ; les vérifications
# globales et lentes vont en `pre-push`.

pre-commit:
  parallel: true
  jobs:
    - name: biome
      glob: "*.{js,jsx,mjs,ts,tsx,json,jsonc,css}"
      run: pnpm exec biome check --write --no-errors-on-unmatched {staged_files}
      # Réindexe ce que Biome a corrigé, sinon le commit part avec la version non formatée.
      stage_fixed: true

commit-msg:
  jobs:
    - name: commitlint
      run: pnpm exec commitlint --edit {1}

pre-push:
  parallel: true
  jobs:
    - name: typecheck
      run: pnpm typecheck
    - name: test
      run: pnpm test
    - name: knip
      run: pnpm knip
```

- [ ] **Step 3 : installer et vérifier les hooks**

Run : `pnpm install && pnpm exec lefthook install && ls .git/hooks | grep -E "pre-commit|commit-msg|pre-push"`
Expected : les trois hooks listés.

Run : `git commit --allow-empty -m "bad message"`
Expected : ÉCHEC (commitlint : `subject may not be empty` / `type may not be empty`).

- [ ] **Step 4 : commit (qui passe par le nouveau hook)**

```bash
git add -A
git commit -m "chore: replace husky and lint-staged with lefthook"
```

Expected : le job `biome` et le job `commitlint` s'exécutent et passent.

---

### Task 4 : Vitest + script typecheck + premiers tests

**Files :**

- Create : `vitest.config.mts`, `src/lib/utils/run.test.ts`
- Modify : `package.json`

**Interfaces :** Produces : `pnpm test` (`vitest run`), `pnpm test:watch`, `pnpm typecheck`
(`next typegen && tsc --noEmit`). Convention : tests colocalisés `src/**/*.test.ts`.

- [ ] **Step 1 : dépendances et scripts**

```bash
pnpm add -D vitest
```

Scripts à ajouter dans `package.json` :

```json
    "typecheck": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 2 : créer `vitest.config.mts`**

```ts
import { defineConfig } from "vitest/config"

/**
 * Tests unitaires — helpers purs, schémas Zod, calculs de course.
 *
 * Environnement `node` : les composants React ne sont pas couverts. Le jour où ils le seront,
 * ce sera par un second projet Vitest sous jsdom plutôt qu'en basculant tout le monde.
 *
 * `src/env.ts` valide à l'import : on fournit des valeurs factices mais de forme valide plutôt
 * que de couper la validation, pour qu'une variable réellement manquante casse encore.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      BETTER_AUTH_SECRET: "test-secret-of-at-least-32-characters",
      STRAVA_CLIENT_ID: "test",
      STRAVA_CLIENT_SECRET: "test",
      STRAVA_WEBHOOK_VERIFY_TOKEN: "test",
      DISCORD_WEBHOOK_URL: "https://discord.test/webhook",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_MAPBOX_TOKEN: "test",
    },
  },
})
```

Si Vitest refuse `resolve.tsconfigPaths` (version antérieure au support natif), installer
`vite-tsconfig-paths` et utiliser `plugins: [tsconfigPaths()]` à la place.

- [ ] **Step 3 : écrire les tests**

`src/lib/utils/run.test.ts` :

```ts
import { describe, expect, it } from "vitest"
import {
  formatDistanceShort,
  formatDuration,
  formatPace,
  formatRunDistance,
  formatRunDurationDisplay,
  formatRunPace,
} from "./run"

describe("formatRunPace", () => {
  it("formate les secondes/km en minutes'secondes\"", () => {
    expect(formatRunPace(330)).toBe(`5'30"`)
  })
  it("complète les secondes sur deux chiffres", () => {
    expect(formatRunPace(305)).toBe(`5'05"`)
  })
})

describe("formatPace", () => {
  it("formate en m:ss", () => {
    expect(formatPace(330)).toBe("5:30")
    expect(formatPace(245)).toBe("4:05")
  })
})

describe("formatRunDurationDisplay", () => {
  it("sans heure", () => {
    expect(formatRunDurationDisplay(1530)).toBe(`25'30"`)
  })
  it("avec heure", () => {
    expect(formatRunDurationDisplay(3750)).toBe(`1h02'30"`)
  })
})

describe("formatDuration", () => {
  it("sans heure", () => {
    expect(formatDuration(1530)).toBe("25:30")
  })
  it("avec heure", () => {
    expect(formatDuration(3750)).toBe("1:02:30")
  })
})

describe("distances", () => {
  it("formatRunDistance convertit des mètres en km à deux décimales", () => {
    expect(formatRunDistance(10500)).toBe("10.50")
  })
  it("formatDistanceShort garde des km à deux décimales", () => {
    expect(formatDistanceShort(10.5)).toBe("10.50")
  })
})
```

- [ ] **Step 4 : lancer**

Run : `pnpm test`
Expected : `Test Files 1 passed`, `Tests 9 passed`.

Run : `pnpm typecheck`
Expected : sortie sans erreur. Si des erreurs de type préexistantes apparaissent, les corriger
dans ce même task (elles bloqueraient le `pre-push`) et les lister dans le message de commit.

- [ ] **Step 5 : commit**

```bash
git add vitest.config.mts src/lib/utils/run.test.ts package.json pnpm-lock.yaml
git commit -m "test: add vitest with run formatter tests and typecheck script"
```

---

### Task 5 : knip

**Files :**

- Create : `knip.jsonc`
- Modify : `package.json`, fichiers signalés par knip

**Interfaces :** Produces : `pnpm knip` à 0 finding (utilisé par lefthook `pre-push` et la CI).

- [ ] **Step 1 : installer**

```bash
pnpm add -D knip
```

Script : `"knip": "knip"`.

- [ ] **Step 2 : créer `knip.jsonc`**

```jsonc
{
  "$schema": "./node_modules/knip/schema.json",

  // Points d'entrée hors graphe Next : scripts CLI lancés par `tsx`, seed Prisma, hooks Claude
  // Code (exécutés par l'agent, jamais importés).
  "entry": ["scripts/*.ts", "prisma/seed.ts", ".claude/hooks/*.mjs"],

  "ignore": [
    // Généré par Prisma.
    "src/generated/**",
    // Généré par shadcn : exporte volontairement plus que ce qu'on consomme ; élaguer casserait
    // la prochaine régénération.
    "src/components/shadcn-ui/**",
  ],
}
```

- [ ] **Step 3 : lancer et traiter chaque finding**

Run : `pnpm knip`

Pour chaque ligne du rapport :

- **Unused file** → `grep -rn "<nom sans extension>" src scripts` ; si aucune référence
  (y compris import dynamique), `git rm` le fichier.
- **Unused export / type** → retirer le mot-clé `export` (garder la fonction si elle est utilisée
  localement, sinon la supprimer).
- **Unused dependency** → `pnpm remove <dep>`.
- **Unlisted dependency** → `pnpm add <dep>` (ou `-D` si outil).
- **Faux positif** avéré (ex. dépendance chargée par une config que knip ne lit pas) → l'ajouter
  à `ignoreDependencies` dans `knip.jsonc` **avec un commentaire qui explique pourquoi**.

Relancer jusqu'à `pnpm knip` sans sortie. Puis `pnpm typecheck && pnpm test && pnpm lint`
doivent passer.

- [ ] **Step 4 : commit**

```bash
git add -A
git commit -m "chore: add knip and remove dead code"
```

Lister dans le corps du commit les fichiers/exports/deps supprimés.

---

### Task 6 : Montée des dépendances + React Compiler

**Files :**

- Modify : `package.json`, `pnpm-lock.yaml`, `next.config.ts`, code impacté

**Interfaces :** aucun contrat nouveau ; tout doit continuer à passer `lint`, `typecheck`,
`test`, `knip`, `build`.

- [ ] **Step 1 : relire les notes de version** via context7 (`resolve-library-id` puis
      `query-docs`) pour : `better-auth` 1.6 → 1.7 (changement de schéma DB ?), `next` 16.2 → 16.3,
      `prisma` 7.7 → 7.10, `next-safe-action` 8.5 → 8.7. Noter les breaking changes trouvés.

- [ ] **Step 2 : monter**

```bash
pnpm up --latest next react react-dom @types/react @types/react-dom \
  @prisma/client @prisma/adapter-pg prisma better-auth next-safe-action \
  zod lucide-react nuqs radix-ui shadcn sonner date-fns up-fetch \
  tailwind-merge @t3-oss/env-nextjs pg @types/pg @tailwindcss/postcss \
  tailwindcss tsx typescript @hookform/resolvers react-hook-form zustand \
  @commitlint/cli @commitlint/config-conventional dotenv
pnpm add -D @types/node@^24
pnpm add recharts@^3
```

(`recharts` était épinglé exactement en `3.8.0` : on passe en `^3`. Si les graphiques de
`/progress` régressent au Step 5, revenir à `recharts@3.8.0` et le noter.)

- [ ] **Step 3 : better-auth** — si les notes de 1.7 annoncent de nouveaux champs :
      `pnpm dlx @better-auth/cli generate --output prisma/schema.prisma` puis relire le diff du schéma,
      et `pnpm db:migrate --name better-auth-1-7` (base de dev uniquement).

- [ ] **Step 4 : React Compiler**

```bash
pnpm add -D babel-plugin-react-compiler
```

`next.config.ts` :

```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
}

export default nextConfig
```

- [ ] **Step 5 : vérifier**

Run : `pnpm lint && pnpm typecheck && pnpm test && pnpm knip && pnpm build`
Expected : tout passe. Puis `pnpm dev` et ouvrir `/home`, `/runs`, `/progress`, `/leaderboard`,
`/settings`, `/admin` : aucune erreur console, graphiques affichés.

- [ ] **Step 6 : commit**

```bash
git add -A
git commit -m "chore: upgrade dependencies and enable react compiler"
```

---

### Task 7 : CI GitHub Actions

**Files :**

- Modify : `.github/workflows/ci.yml` (réécriture complète)

**Interfaces :** Consumes : scripts `lint`, `typecheck`, `test`, `knip`, `build` ; `.nvmrc` ;
`packageManager`.

- [ ] **Step 1 : réécrire `ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:

# Un nouveau push annule le run précédent de la même ref.
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  quality:
    name: Lint · Types · Tests · Knip · Build
    runs-on: ubuntu-latest
    timeout-minutes: 15

    # `pnpm install` lance `prisma generate` (postinstall) qui lit DATABASE_URL, et `build`
    # valide src/env.ts : les secrets doivent être présents au niveau du job.
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
      NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
      STRAVA_CLIENT_ID: ${{ secrets.STRAVA_CLIENT_ID }}
      STRAVA_CLIENT_SECRET: ${{ secrets.STRAVA_CLIENT_SECRET }}
      STRAVA_WEBHOOK_VERIFY_TOKEN: ${{ secrets.STRAVA_WEBHOOK_VERIFY_TOKEN }}
      DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
      NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.NEXT_PUBLIC_MAPBOX_TOKEN }}

    steps:
      - uses: actions/checkout@v7

      # Version de pnpm lue depuis `packageManager` ; doit précéder setup-node pour `cache: pnpm`.
      - uses: pnpm/action-setup@v6

      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint (Biome)
        run: pnpm exec biome ci

      - name: Typecheck
        run: pnpm typecheck

      - name: Tests
        run: pnpm test

      - name: Knip
        run: pnpm knip

      - name: Build
        run: pnpm build
```

- [ ] **Step 2 : valider la syntaxe localement**

Run : `pnpm dlx @action-validator/cli .github/workflows/ci.yml`
Expected : aucune erreur. (Si l'outil n'est pas disponible, vérifier au minimum
`node -e "require('node:fs').readFileSync('.github/workflows/ci.yml','utf8')"` et relire.)

- [ ] **Step 3 : commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: unify pipeline with biome, typecheck, tests, knip and build"
```

---

### Task 8 : Config Claude Code — settings, hooks, agents

**Files :**

- Rewrite : `.claude/settings.json`
- Create : `.claude/hooks/biome-format.mjs`, `.claude/hooks/conventions-guard.mjs`,
  `.claude/agents/convention-reviewer.md`, `.claude/agents/next-docs.md`

**Interfaces :** Consumes : binaire Biome (Task 2). knip lit `.claude/hooks/*.mjs` comme entrées
(Task 5).

- [ ] **Step 1 : `.claude/hooks/biome-format.mjs`**

```js
#!/usr/bin/env node
/**
 * PostToolUse hook — formate et corrige le seul fichier que Claude vient d'écrire.
 *
 * Remplace l'ancien hook qui lançait `pnpm lint` sur tout le projet via python3 à chaque
 * édition. Sort toujours en 0 : une erreur non auto-corrigeable ne bloque pas l'édition.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const BIOME = resolve(PROJECT_ROOT, "node_modules/@biomejs/biome/bin/biome")
const FORMATTABLE = /\.(m?[jt]sx?|css|jsonc?)$/

let raw = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  raw += chunk
})
process.stdin.on("end", () => {
  let file
  try {
    const payload = JSON.parse(raw)
    file = payload.tool_response?.filePath ?? payload.tool_input?.file_path
  } catch {
    process.exit(0)
  }

  if (
    !file ||
    !FORMATTABLE.test(file) ||
    !existsSync(file) ||
    !existsSync(BIOME)
  )
    process.exit(0)

  try {
    execFileSync(process.execPath, [BIOME, "check", "--write", file], {
      cwd: PROJECT_ROOT,
      stdio: "ignore",
    })
  } catch {
    // Règle non auto-corrigeable : on laisse passer, `pnpm lint` la remontera.
  }
  process.exit(0)
})
```

- [ ] **Step 2 : `.claude/hooks/conventions-guard.mjs`**

```js
#!/usr/bin/env node
/**
 * PreToolUse hook — refuse une écriture qui viole une règle non négociable des CLAUDE.md.
 *
 * Uniquement des règles déterministes (chemin ou regex). Ce qui demande du jugement va dans
 * l'agent `convention-reviewer`. Sortie 2 = écriture bloquée, stderr revient à l'agent.
 * Toute autre situation sort en 0 : un hook cassé ne doit jamais empêcher de travailler.
 */
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

/** Fichiers chargés hors de Next (configs, CLI `tsx`) : seuls autorisés à lire `process.env`. */
const ENV_ALLOWLIST = [
  "src/env.ts",
  "next.config.ts",
  "prisma.config.ts",
  "postcss.config.mjs",
  "vitest.config.mts",
  "prisma/seed.ts",
]

const ROUTE_SEGMENTS =
  "home|runs|progress|leaderboard|badges|compare|settings|onboarding|login|register|admin|profile"

/**
 * @param {string} path chemin POSIX relatif à la racine
 * @param {string} content contenu écrit (fichier complet ou fragment)
 * @returns {string | null}
 */
export function check(path, content) {
  const isCode = /\.(m?[jt]sx?)$/.test(path)
  const isSource = /^src\/.*\.(m?tsx?)$/.test(path)
  const isCli = path.startsWith("scripts/") || path.startsWith(".claude/")

  if (
    isCode &&
    /\bprocess\.env\b/.test(content) &&
    !ENV_ALLOWLIST.includes(path) &&
    !isCli
  ) {
    return `\`process.env\` est interdit ici. Déclarer la variable dans \`src/env.ts\` (bloc \`server\` ou \`client\` + \`experimental__runtimeEnv\` pour NEXT_PUBLIC_) puis \`import { env } from "@/env"\`.`
  }

  if (
    isSource &&
    /new\s+PrismaClient\s*\(/.test(content) &&
    !path.startsWith("src/lib/db/")
  ) {
    return `Ne jamais instancier \`PrismaClient\` : utiliser le singleton \`import { prisma } from "@/lib/db/prisma"\`.`
  }

  if (isSource && /["']@hookform\/resolvers\/zod["']/.test(content)) {
    return `Zod v4 est incompatible avec \`@hookform/resolvers/zod\`. Utiliser \`standardSchemaResolver\` de \`@hookform/resolvers/standard-schema\`.`
  }

  if (isSource && /z\.string\(\)\s*\.email\(/.test(content)) {
    return `Zod v4 : utiliser \`z.email()\` et non \`z.string().email()\`.`
  }

  if (
    /^src\/app\/.*\/(page|layout)\.tsx$/.test(path) &&
    /^\s*["']use client["']/m.test(content)
  ) {
    return `\`"use client"\` ne se pose pas sur une \`page.tsx\` / \`layout.tsx\`. Le poser sur la feuille interactive dans \`_components/\`.`
  }

  if (
    isSource &&
    path !== "src/lib/constants/routes.ts" &&
    new RegExp(
      `(href|push|replace|redirect)\\s*[=(]\\s*\\{?\\s*["'\`]/(${ROUTE_SEGMENTS})\\b`,
    ).test(content)
  ) {
    return `Chemin codé en dur. Utiliser \`ROUTES.*\`, \`AUTH_ROUTES.*\`, \`ADMIN_ROUTES.*\`, \`runRoute(id)\` ou \`profileRoute(username)\` de \`@/lib/constants/routes\`.`
  }

  if (isSource && /ActionClient[\s\S]*?\.schema\s*\(/.test(content)) {
    return `\`.schema()\` est l'API next-safe-action v7. En v8 : \`.inputSchema(...)\`.`
  }

  return null
}

let raw = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  raw += chunk
})
process.stdin.on("end", () => {
  let input
  try {
    input = JSON.parse(raw).tool_input ?? {}
  } catch {
    process.exit(0)
  }

  const file = input.file_path
  if (!file) process.exit(0)

  // Règles écrites en chemins POSIX ; le hook tourne sous Windows.
  const path = relative(PROJECT_ROOT, resolve(file)).replaceAll("\\", "/")
  if (path.startsWith("..")) process.exit(0)

  const reason = check(path, input.content ?? input.new_string ?? "")
  if (reason) {
    process.stderr.write(`[conventions] ${path}\n\n${reason}\n`)
    process.exit(2)
  }
  process.exit(0)
})
```

- [ ] **Step 3 : tester le garde à la main**

```bash
echo '{"tool_input":{"file_path":"src/app/(app)/x.ts","content":"const a = process.env.FOO"}}' | node .claude/hooks/conventions-guard.mjs; echo "exit=$?"
```

Expected : message `[conventions] ...process.env...` et `exit=2`.

```bash
echo '{"tool_input":{"file_path":"src/env.ts","content":"process.env.FOO"}}' | node .claude/hooks/conventions-guard.mjs; echo "exit=$?"
```

Expected : `exit=0`.

```bash
echo '{"tool_input":{"file_path":"src/components/ui/a.tsx","content":"<Link href=\"/home\">"}}' | node .claude/hooks/conventions-guard.mjs; echo "exit=$?"
```

Expected : `exit=2` (chemin codé en dur).

Vérifier aussi qu'aucun fichier existant du dépôt ne serait refusé :

```bash
for f in $(git ls-files 'src/**/*.ts' 'src/**/*.tsx' | grep -v generated); do
  node -e "const fs=require('fs');process.stdout.write(JSON.stringify({tool_input:{file_path:process.argv[1],content:fs.readFileSync(process.argv[1],'utf8')}}))" "$f" \
  | node .claude/hooks/conventions-guard.mjs >/dev/null 2>&1 || echo "REFUS: $f"
done
```

Expected : aucune ligne `REFUS`. Si une ligne apparaît, soit le code viole réellement la
convention (le corriger dans ce task), soit la regex est trop large (la resserrer).

- [ ] **Step 4 : `.claude/settings.json`**

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(pnpm dev*)",
      "Bash(pnpm lint*)",
      "Bash(pnpm format*)",
      "Bash(pnpm build*)",
      "Bash(pnpm typecheck*)",
      "Bash(pnpm test*)",
      "Bash(pnpm knip*)",
      "Bash(pnpm install*)",
      "Bash(pnpm add *)",
      "Bash(pnpm db:generate*)",
      "Bash(pnpm db:studio*)",
      "Bash(pnpm exec biome*)",
      "Bash(pnpm exec knip*)",
      "Bash(pnpm exec tsc*)",
      "Bash(pnpm exec vitest*)",
      "Bash(pnpm exec lefthook*)",
      "Bash(pnpm dlx shadcn*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git show*)",
      "Bash(git branch*)",
      "Bash(gh pr view*)",
      "Bash(gh pr diff*)",
      "Bash(gh run list*)",
      "Bash(gh run view*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/conventions-guard.mjs\"",
            "timeout": 10,
            "statusMessage": "Conventions"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/biome-format.mjs\"",
            "timeout": 20,
            "statusMessage": "Biome"
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "prisma@claude-plugins-official": true,
    "context7@claude-plugins-official": true,
    "playwright@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true
  }
}
```

Note : `db:migrate`, `db:push`, `db:reset` restent volontairement hors allowlist (écrivent en
base).

- [ ] **Step 5 : `.claude/agents/convention-reviewer.md`**

```markdown
---
name: convention-reviewer
description: Relit un diff contre les conventions écrites du projet (CLAUDE.md racine et src/lib/*/CLAUDE.md) — placement des fichiers, frontière server/client, routes, Zod v4, safe-action, env, Prisma. À lancer avant un commit ou une PR, ou sur "relis mes changements", "est-ce que ça respecte les conventions ?". Ne cherche pas les bugs — pour ça, /code-review.
tools: Read, Grep, Glob, Bash
---

Tu relis des changements **contre les conventions écrites de ce projet**, rien d'autre. Pas de
chasse aux bugs, pas de refactor d'opportunité, pas de commentaire sur ce que Biome formate.

## Méthode

1. Lire `CLAUDE.md` à la racine puis chaque `src/lib/*/CLAUDE.md`. Ce sont les seules sources
   d'autorité — jamais une convention Next.js générique.
2. Récupérer le diff : `git diff` (ou `git diff main...HEAD` si une branche est indiquée).
3. Pour chaque fichier touché, vérifier la grille.
4. Ne rapporter que des violations **vérifiées**, en citant la règle. Zéro violation est une
   réponse valide — le dire en une ligne.

## Grille

**Placement**

- Une route suit `{route}/_actions/`, `_components/`, `_schemas/`, `_utils/`, `page.tsx`.
- Une action utilisée par plusieurs routes vit dans `src/lib/actions/`, sinon dans le `_actions/`
  de sa route.
- Composants shadcn générés dans `src/components/shadcn-ui/`, composants maison partagés dans
  `src/components/ui/` ou `src/components/layout/`.

**Frontière server / client**

- `_actions/*` commence par `"use server"`, `_components/*` interactifs par `"use client"`.
- `"use client"` jamais sur `page.tsx` / `layout.tsx`.
- `auth` (`@/lib/auth`) seulement côté serveur ; `authClient` seulement côté client.
- Appels `auth.api.*` dans une action : `headers: await headers()` transmis.

**Données**

- Server Actions via `actionClient` / `authActionClient` / `adminActionClient`, API v8
  `.inputSchema(...)`.
- Erreur métier attendue → `return { error: "..." }` ; imprévue → `throw new Error`.
- Zod v4 : `z.email()` ; messages en **français** ; type exporté via `z.infer`.
- Formulaires : `standardSchemaResolver`.
- `process.env` uniquement dans `src/env.ts` (et configs / scripts CLI).
- Prisma via le singleton `@/lib/db/prisma`.
- Formatage de course via `src/lib/utils/run.ts` : `formatRunPace`/`formatRunDurationDisplay`
  pour l'UI, `formatPace`/`formatDuration` pour les graphes, `formatRunDistance` prend des
  **mètres**.

**Routes**

- Aucun chemin en dur : `ROUTES.*`, `AUTH_ROUTES.*`, `ADMIN_ROUTES.*`, `API_ROUTES.*`,
  `runRoute(id)`, `profileRoute(username)`.

## Format de sortie

Pour chaque violation, trois lignes :

    <fichier>:<ligne> — <la règle enfreinte, citée>
    Ce qui est écrit : <constat factuel>
    Correctif : <l'action précise>

Classer : frontière server/client et fuite d'env d'abord, données ensuite, placement et nommage
en dernier. Ne modifier aucun fichier.
```

- [ ] **Step 6 : `.claude/agents/next-docs.md`**

```markdown
---
name: next-docs
description: Répond à une question sur Next.js 16 en lisant la documentation embarquée dans node_modules/next/dist/docs/, plutôt qu'en se fiant à la mémoire du modèle. À utiliser dès qu'une API Next est incertaine — params/searchParams asynchrones, Server Actions, proxy/middleware, parallel routes (@rightPanel), authInterrupts (forbidden/unauthorized), next.config, métadonnées, ImageResponse (OG), revalidation, streaming, React Compiler.
tools: Read, Grep, Glob
---

Tu réponds **uniquement à partir de la documentation embarquée**, jamais de mémoire : cette
version de Next diverge des données d'entraînement.

## Où chercher

    node_modules/next/dist/docs/
    ├── 01-app/            # App Router — 95 % des cas
    ├── 02-pages/          # hors sujet
    ├── 03-architecture/
    └── index.md

`Grep` sur le terme exact dans `01-app/`, puis `Read` des fichiers pertinents **en entier** avant
de conclure (les dépréciations vivent souvent plus bas dans la page).

## Contexte du projet

- Next 16.3, App Router, Turbopack, React 19, React Compiler activé.
- `experimental.authInterrupts: true`.
- Slot parallèle `@rightPanel` dans le groupe `(app)`.
- Routes API : `auth/[...all]`, `strava/*`, `runs/[id]/gpx`, `og/run/[runId]` (ImageResponse).

## Réponse attendue

1. La réponse directe, avec la signature exacte de l'API.
2. Le chemin du fichier de doc qui l'établit.
3. Les avertissements et dépréciations rencontrés.

Si la doc locale ne couvre pas le point, le dire explicitement. Ne modifier aucun fichier.
```

- [ ] **Step 7 : vérifier et commit**

Run : `pnpm lint && pnpm knip`
Expected : passent (knip voit les hooks comme entrées).

```bash
git add .claude/settings.json .claude/hooks .claude/agents
git commit -m "chore: add claude code hooks, agents and permissions"
```

---

### Task 9 : Skills versionnées + CLAUDE.md

**Files :**

- Copy : `.claude/skills/{better-auth-best-practices,better-auth-security-best-practices,prisma-cli,prisma-client-api,upfetch,shadcn,vercel-react-best-practices,web-design-guidelines,ui-ux-pro-max,playwright-best-practices}`
- Create : `.claude/SKILLS.md`
- Modify : `.claude/skills/form/SKILL.md`, `.claude/skills/new-component/SKILL.md`,
  `.claude/skills/new-route/SKILL.md` (si elles mentionnent ESLint/Prettier), `CLAUDE.md`

- [ ] **Step 1 : copier** (les skills personnelles sont des liens symboliques → `-L`)

```bash
for s in better-auth-best-practices better-auth-security-best-practices prisma-cli \
  prisma-client-api upfetch shadcn vercel-react-best-practices web-design-guidelines \
  ui-ux-pro-max playwright-best-practices; do
  cp -rL ~/.claude/skills/$s .claude/skills/$s
done
find .claude/skills -name "__pycache__" -type d -exec rm -rf {} +
ls .claude/skills
```

Expected : 13 dossiers (10 copiés + `form`, `new-component`, `new-route`).

- [ ] **Step 2 : exclure les skills de Biome et knip** — ce sont des docs tierces, pas du code
      du projet. Ajouter `"!.claude/skills"` à `files.includes` de `biome.json`, et
      `".claude/skills/**"` à `ignore` de `knip.jsonc`. Run : `pnpm lint && pnpm knip` → passent.

- [ ] **Step 3 : `.claude/SKILLS.md`**

```markdown
# Skills du projet — provenance

Il n'existe **aucun lock pour les skills** : une skill est un dossier avec un `SKILL.md`, sans
version ni somme de contrôle. **La copier dans `.claude/skills/` est donc le mécanisme de lock** :
le contenu est figé et versionné avec le dépôt, qui suffit sur une machine neuve. Contrepartie :
ces copies ne reçoivent jamais les corrections amont.

**À mettre à jour à chaque ajout ou rafraîchissement.**

## Propres au projet

| Skill           | Rôle                                                          |
| --------------- | ------------------------------------------------------------- |
| `form`          | Formulaire React Hook Form + Zod v4 + composants Field shadcn |
| `new-component` | Composant selon l'architecture en couches                     |
| `new-route`     | Route : page, action, schéma, composant                       |

## Copies figées de skills externes

Copiées depuis `~/.claude/skills/` le **26 septembre 2026**.

| Skill                                 | Origine     | Utile pour                          |
| ------------------------------------- | ----------- | ----------------------------------- |
| `better-auth-best-practices`          | Better Auth | config auth, plugins username/admin |
| `better-auth-security-best-practices` | Better Auth | rate limit, sessions, secrets       |
| `prisma-cli`                          | Prisma      | migrations, generate                |
| `prisma-client-api`                   | Prisma      | requêtes                            |
| `upfetch`                             | up-fetch    | client Strava / Discord             |
| `shadcn`                              | shadcn/ui   | composants, registre (shadcn-map)   |
| `vercel-react-best-practices`         | Vercel      | perf React / Next                   |
| `web-design-guidelines`               | Vercel      | audit UI / accessibilité            |
| `ui-ux-pro-max`                       | communauté  | direction visuelle de la refonte    |
| `playwright-best-practices`           | communauté  | tests e2e, audit navigué            |

Ces skills existent aussi en version personnelle : **doublon assumé**, prix de la portabilité.

### Rafraîchir une copie

    rm -rf .claude/skills/<nom> && cp -rL ~/.claude/skills/<nom> .claude/skills/<nom>

Puis mettre à jour la date ci-dessus. À faire lors d'une montée majeure de la lib concernée.

## Agents

| Agent                 | Rôle                                                     |
| --------------------- | -------------------------------------------------------- |
| `convention-reviewer` | Relit un diff contre les CLAUDE.md du projet             |
| `next-docs`           | Répond sur Next 16 depuis `node_modules/next/dist/docs/` |

## Hooks

| Hook                    | Événement              | Rôle                                                                                                                                                  |
| ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conventions-guard.mjs` | PreToolUse Write/Edit  | refuse `process.env` hors env, `new PrismaClient`, resolver zod, `z.string().email()`, `"use client"` sur page/layout, chemins en dur, `.schema()` v7 |
| `biome-format.mjs`      | PostToolUse Write/Edit | `biome check --write` sur le fichier écrit                                                                                                            |
```

- [ ] **Step 4 : skills projet** — `grep -rn -i "eslint\|prettier" .claude/skills/form .claude/skills/new-component .claude/skills/new-route` ; remplacer chaque mention par l'équivalent Biome (`pnpm lint`, `pnpm lint:fix`). Si aucune occurrence, ne rien modifier.

- [ ] **Step 5 : `CLAUDE.md` racine**

Remplacer la ligne **Commits** par :

```markdown
**Commits** — conventional commits enforced by commitlint via lefthook: `feat | fix | chore | refactor | docs | style | test | perf | ci`. Pre-commit runs `biome check --write` on staged files; pre-push runs `typecheck`, `test` and `knip`.

**Strava** — the Strava API app is **inactive** since 2026-08-19. No run arrives through Strava; do not debug import failures as code bugs. Manual entry + GPX/FIT import replace it (phase 2 of `docs/superpowers/specs/2026-09-26-refonte-roadmap-design.md`).
```

Remplacer le tableau **Scripts** par :

```markdown
| Script             | Purpose                               |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start dev server (Turbopack)          |
| `pnpm build`       | Production build                      |
| `pnpm lint`        | Biome lint + format check             |
| `pnpm lint:fix`    | Biome with safe fixes                 |
| `pnpm format`      | Biome format write                    |
| `pnpm typecheck`   | `next typegen` + `tsc --noEmit`       |
| `pnpm test`        | Vitest (colocated `src/**/*.test.ts`) |
| `pnpm knip`        | Dead code / dependencies              |
| `pnpm db:migrate`  | Create + apply migration (dev)        |
| `pnpm db:push`     | Push schema without migration file    |
| `pnpm db:studio`   | Open Prisma Studio                    |
| `pnpm db:seed`     | Seed the database                     |
| `pnpm db:generate` | Regenerate Prisma client              |
```

Ajouter sous le titre `## Tech Stack` la ligne :

```markdown
- **Tooling**: Node 24 (`.nvmrc`), pnpm 11, Biome, lefthook, knip, Vitest, React Compiler. Claude Code config in `.claude/` (see `.claude/SKILLS.md`)
```

- [ ] **Step 6 : commit**

```bash
git add .claude CLAUDE.md biome.json knip.jsonc
git commit -m "docs: vendor claude skills and document new tooling"
```

---

### Task 10 : Rapport de santé

**Files :**

- Create : `docs/audit/2026-09-health.md`

- [ ] **Step 1 : collecter** (garder les sorties brutes dans le scratchpad)

```bash
pnpm lint; pnpm typecheck; pnpm test; pnpm knip; pnpm build
pnpm outdated
pnpm audit --prod
```

- [ ] **Step 2 : passe sécurité ciblée** — lire et consigner un verdict (OK / risque + gravité)
      pour :

1. `prisma/schema.prisma` `StravaAccount.accessToken/refreshToken` : stockés en clair ?
2. `src/app/api/strava/webhook/route.ts` : le `GET` vérifie `hub.verify_token` ; le `POST`
   authentifie-t-il l'appelant (owner_id connu, subscription_id) ?
3. `src/app/api/runs/[id]/gpx` et `src/app/api/og/run/[runId]` : accessibles sans session ?
   exposent-ils des courses d'autres utilisateurs ?
4. Chaque fichier `src/app/(admin)/**/_actions/*` utilise-t-il `adminActionClient` ?
5. `src/lib/auth/index.ts` : `trustedOrigins`, rate limit, désactivation du sign-up en prod.

- [ ] **Step 3 : écrire le rapport** avec exactement ces sections :

```markdown
# Rapport de santé — septembre 2026

## Résumé

<3 à 5 lignes : état global, top 3 des problèmes>

## Outils

| Contrôle  | Résultat | Détail |
| --------- | -------- | ------ |
| Biome     | ✅/❌    | …      |
| Typecheck | …        | …      |
| Tests     | …        | …      |
| Knip      | …        | …      |
| Build     | …        | …      |

## Dépendances

<sortie résumée de `pnpm outdated` restante après Task 6, et vulnérabilités de `pnpm audit`>

## Sécurité

<un paragraphe par point 1 à 5 du Step 2, avec gravité>

## Corrigé pendant la phase 1

<liste>

## Reporté (entrée de la phase 4)

<liste priorisée P1/P2/P3>
```

- [ ] **Step 4 : commit**

```bash
git add docs/audit/2026-09-health.md
git commit -m "docs: add phase 1 health report"
```

---

## Vérification finale de la phase

Run : `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm knip && pnpm build`
Expected : tout passe. `git log --oneline main..dev` liste les commits des Tasks 1 à 10.
Puis `pnpm dev` : l'app démarre et `/home` s'affiche.
