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
