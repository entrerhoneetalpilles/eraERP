import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@conciergerie/ui",
    "@conciergerie/db",
    "@conciergerie/types",
    "@conciergerie/email",
    "@conciergerie/storage",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ovh.net" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
}

export default nextConfig
