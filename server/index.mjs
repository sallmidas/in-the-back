import path from "node:path"
import { createApp } from "./app.mjs"

const port = Number(process.env.ITB_PORT || process.env.PORT || 43174)
const host = process.env.ITB_HOST || "127.0.0.1"
const storePath = process.env.ITB_STORE_PATH || path.join(process.cwd(), "data", "board.json")
const staticRoot = process.env.ITB_STATIC ? path.resolve(process.env.ITB_STATIC) : null

const { server } = createApp({ storePath, staticRoot })

server.listen(port, host, () => {
  const where = staticRoot ? ` and ${staticRoot}` : ""
  console.log(`In the Back API on http://${host}:${port}${where}`)
})
