import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { createApp } from "../server/app.mjs"

export async function withServer(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-"))
  const { server } = createApp({ storePath: path.join(dir, "board.json") })
  const port = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port))
  })
  const base = `http://127.0.0.1:${port}`
  try {
    await fn({ base, client: apiClient(base) })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await rm(dir, { recursive: true, force: true })
  }
}

export function apiClient(base) {
  let cookie = ""
  return {
    async request(method, pathname, body) {
      const headers = {}
      if (body !== undefined) headers["content-type"] = "application/json"
      if (cookie) headers.cookie = cookie
      const response = await fetch(`${base}${pathname}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      const setCookies = response.headers.getSetCookie?.() ?? []
      for (const item of setCookies) {
        const [pair] = item.split(";")
        if (!pair?.startsWith("itb_session=")) continue
        const value = pair.slice("itb_session=".length)
        cookie = value ? `itb_session=${value}` : ""
      }
      const text = await response.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { error: text }
      }
      return { status: response.status, data }
    },
  }
}

export const sampleFiling = {
  create: true,
  workplaceName: "North Kitchen",
  city: "Cicero",
  region: "IL",
  industry: "restaurant",
  roomKind: "walk-in",
  score: 4,
  context: "Tuesday close · prep",
  excerpt: "Walk-in was warm. Dairy on a sheet pan. Nobody logged a temp all close.",
}
