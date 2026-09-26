import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    // Import de fichiers GPX/FIT (≤ 15 Mo) via Server Action ; défaut Next : 1 Mo.
    serverActions: { bodySizeLimit: "16mb" },
  },
}

export default nextConfig
