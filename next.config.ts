import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    domains: ['cdn.discordapp.com'],
  },
};

export default nextConfig;
