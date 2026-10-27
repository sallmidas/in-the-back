import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const demoOn = env.VITE_DEMO_SEED === "1"
  const root = import.meta.dirname

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: "@/data/seed",
          replacement: path.resolve(root, demoOn ? "src/data/seed.ts" : "src/data/seed.empty.ts"),
        },
        { find: "@", replacement: path.resolve(root, "src") },
      ],
    },
    server: {
      host: "127.0.0.1",
      port: 43173,
      strictPort: true,
      proxy: {
        "/api": {
          target: process.env.ITB_API_PROXY || "http://127.0.0.1:43174",
        },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 43173,
      strictPort: true,
      proxy: {
        "/api": {
          target: process.env.ITB_API_PROXY || "http://127.0.0.1:43174",
        },
      },
    },
  }
})
