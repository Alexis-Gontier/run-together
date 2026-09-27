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
  "playwright.config.ts",
  "prisma/seed.ts",
]

/** `href="/home"`, `redirect("/login")`, `router.push(\`/runs/${id}\`)`… vers une route connue. */
const HARDCODED_ROUTE =
  /(href|push|replace|redirect)\s*[=(]\s*\{?\s*["'`]\/(home|runs|progress|leaderboard|badges|compare|settings|onboarding|login|register|admin|profile)\b/

/**
 * @param {string} path chemin POSIX relatif à la racine
 * @param {string} content contenu écrit (fichier complet ou fragment)
 * @returns {string | null}
 */
function check(path, content) {
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
    HARDCODED_ROUTE.test(content)
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
