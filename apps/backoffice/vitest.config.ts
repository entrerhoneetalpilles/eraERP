import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@conciergerie/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@conciergerie/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
    },
  },
})
