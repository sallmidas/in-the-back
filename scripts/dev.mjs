import { spawn } from "node:child_process"
import process from "node:process"

const port = process.env.ITB_PORT || "43174"
const server = spawn(process.execPath, ["server/index.mjs"], {
  stdio: "inherit",
  env: { ...process.env, ITB_PORT: port },
})

let vite = null
let shuttingDown = false

function shutdown(code) {
  if (shuttingDown) return
  shuttingDown = true
  server.kill("SIGTERM")
  if (vite) vite.kill("SIGTERM")
  process.exit(code)
}

async function waitForApi() {
  const url = `http://127.0.0.1:${port}/api/board`
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      /* server still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error("The API did not start. Check the log above.")
}

server.on("exit", (code) => {
  if (!shuttingDown) shutdown(code ?? 1)
})

waitForApi()
  .then(() => {
    vite = spawn(
      process.execPath,
      ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "43173"],
      { stdio: "inherit", env: process.env },
    )
    vite.on("exit", (code) => {
      if (!shuttingDown) shutdown(code ?? 0)
    })
  })
  .catch((error) => {
    console.error(error.message)
    shutdown(1)
  })

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))
