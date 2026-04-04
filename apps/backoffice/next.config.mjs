import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

// Load monorepo root .env (apps/backoffice is 2 levels below root)
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../.env"), override: false })

/** @type {import('next').NextConfig} */
const nextConfig = {
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
