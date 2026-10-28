import { randomBytes } from "node:crypto"
import { mkdir, open, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

export function emptyStore() {
  return {
    version: 1,
    users: [],
    sessions: [],
    chairUserId: null,
    chairClaimedAt: null,
    workplaces: [],
    reports: [],
    storeClaims: [],
    publicRecords: [],
    recordErrors: [],
  }
}

export function createStore(filePath) {
  const lockPath = `${filePath}.lock`

  async function read() {
    try {
      const raw = await readFile(filePath, "utf8")
      const parsed = JSON.parse(raw)
      const data = { ...emptyStore(), ...parsed }
      if (!Array.isArray(data.storeClaims)) data.storeClaims = []
      if (!Array.isArray(data.publicRecords)) data.publicRecords = []
      if (!Array.isArray(data.recordErrors)) data.recordErrors = []
      return data
    } catch (error) {
      if (error && error.code === "ENOENT") return emptyStore()
      throw error
    }
  }

  async function write(data) {
    await mkdir(path.dirname(filePath), { recursive: true })
    const tmp = `${filePath}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`
    await writeFile(tmp, JSON.stringify(data, null, 2))
    await rename(tmp, filePath)
  }

  async function acquire() {
    await mkdir(path.dirname(filePath), { recursive: true })
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        return await open(lockPath, "wx")
      } catch (error) {
        if (!error || error.code !== "EEXIST") throw error
        try {
          const info = await stat(lockPath)
          if (Date.now() - info.mtimeMs > 10_000) await unlink(lockPath)
        } catch {
          /* lock vanished or is still live */
        }
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
    }
    throw new Error("Could not lock the board store")
  }

  async function update(mutator) {
    const handle = await acquire()
    try {
      const data = await read()
      const result = await mutator(data)
      await write(data)
      return result
    } finally {
      await handle.close()
      await rm(lockPath, { force: true })
    }
  }

  return { read, update, filePath }
}
