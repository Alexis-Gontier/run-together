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
    },
  },
})
