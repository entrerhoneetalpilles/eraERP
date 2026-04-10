import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin"

// Load monorepo root .env (apps/portal is 2 levels below root)
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../.env"), override: false })

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@conciergerie/ui",
    "@conciergerie/db",
    "@conciergerie/types",
    "@conciergerie/email",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ovh.net" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    return config
  },
}

export default nextConfig
