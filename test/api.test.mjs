import assert from "node:assert/strict"
import test from "node:test"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { createApp } from "../server/app.mjs"
import { apiClient, sampleFiling, withServer } from "./helpers.mjs"

test("a filed report is stored and comes back on the board", async () => {
  await withServer(async ({ client }) => {
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
    assert.equal(filed.data.report.excerpt, sampleFiling.excerpt)
    assert.ok(filed.data.receipt)
    assert.equal(JSON.stringify(filed.data.report).includes(filed.data.receipt), false)

    const board = await client.request("GET", "/api/board")
    assert.equal(board.status, 200)
    assert.equal(board.data.reports.length, 1)
    assert.equal(board.data.reports[0].excerpt, sampleFiling.excerpt)
    assert.equal(board.data.workplaces[0].slug, "north-kitchen")
    assert.equal(board.data.workplaces[0].rooms[0].score, 4)
    assert.equal(JSON.stringify(board.data).includes(filed.data.receipt), false)
  })
})

test("the store survives a restart", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-"))
  const storePath = path.join(dir, "board.json")
  const first = createApp({ storePath })
  const port = await new Promise((resolve) => {
    first.server.listen(0, "127.0.0.1", () => resolve(first.server.address().port))
  })
  const client = apiClient(`http://127.0.0.1:${port}`)
  try {
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
    await new Promise((resolve) => first.server.close(resolve))
    const second = createApp({ storePath })
    const port2 = await new Promise((resolve) => {
      second.server.listen(0, "127.0.0.1", () => resolve(second.server.address().port))
    })
    const again = await fetch(`http://127.0.0.1:${port2}/api/board`)
    const body = await again.json()
    assert.equal(body.reports[0].excerpt, sampleFiling.excerpt)
    await new Promise((resolve) => second.server.close(resolve))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test("server rejects a personal name even if the client skips its check", async () => {
  await withServer(async ({ client }) => {
    const filed = await client.request("POST", "/api/reports", {
      ...sampleFiling,
      excerpt: "John Smith left the dairy on the floor.",
    })
    assert.equal(filed.status, 400)
    assert.match(filed.data.error, /names/i)
    const board = await client.request("GET", "/api/board")
    assert.equal(board.data.reports.length, 0)
  })
})

test("the first account claims the chair once and everyone else is refused", async () => {
  await withServer(async ({ base, client }) => {
    const anon = await client.request("POST", "/api/chair/claim", {})
    assert.equal(anon.status, 401)

    const first = await client.request("POST", "/api/auth/register", {
      email: "saul@example.com",
      password: "correct-horse",
    })
    assert.equal(first.status, 201)
    assert.equal(first.data.chair.claimed, false)

    const claim = await client.request("POST", "/api/chair/claim", {})
    assert.equal(claim.status, 200)
    assert.equal(claim.data.chair.mine, true)

    const again = await client.request("POST", "/api/chair/claim", {})
    assert.equal(again.status, 200)
    assert.equal(again.data.chair.mine, true)

    await client.request("POST", "/api/auth/logout", {})
    const other = apiClient(base)
    const second = await other.request("POST", "/api/auth/register", {
      email: "other@example.com",
      password: "another-horse",
    })
    assert.equal(second.status, 201)
    const refused = await other.request("POST", "/api/chair/claim", {})
    assert.equal(refused.status, 409)
    assert.match(refused.data.error, /already claimed/i)

    const board = await other.request("GET", "/api/board")
    assert.equal(JSON.stringify(board.data).includes("saul@example.com"), false)
    const me = await other.request("GET", "/api/auth/me")
    assert.equal(me.data.chair.claimed, true)
    assert.equal(me.data.chair.mine, false)
    assert.equal(JSON.stringify(me.data).includes("saul@example.com"), false)

    const returned = apiClient(base)
    const login = await returned.request("POST", "/api/auth/login", {
      email: "saul@example.com",
      password: "correct-horse",
    })
    assert.equal(login.status, 200)
    assert.equal(login.data.chair.mine, true)

    const release = await returned.request("POST", "/api/chair/release", {})
    assert.equal(release.status, 404)
  })
})

test("a filer retracts with a receipt or their account, and a kitchen cannot delete", async () => {
  await withServer(async ({ base, client }) => {
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
    const receipt = filed.data.receipt
    const id = filed.data.report.id

    const stranger = apiClient(base)
    await stranger.request("POST", "/api/auth/register", {
      email: "stranger@example.com",
      password: "stranger-pass",
    })
    const stolen = await stranger.request("POST", "/api/me/reports/retract", { reportId: id })
    assert.equal(stolen.status, 404)

    const deleted = await stranger.request("DELETE", `/api/reports/${id}`)
    assert.equal(deleted.status, 405)
    assert.match(deleted.data.error, /cannot delete/i)

    const resolved = await stranger.request("POST", "/api/reports/resolve", {})
    assert.equal(resolved.status, 404)

    const wrong = await client.request("POST", "/api/reports/retract", { receipt: "ZZZZ-ZZZZ-ZZZZ" })
    assert.equal(wrong.status, 400)
    const still = await client.request("GET", "/api/board")
    assert.equal(still.data.reports.length, 1)

    const retracted = await client.request("POST", "/api/reports/retract", { receipt })
    assert.equal(retracted.status, 200)
    const after = await client.request("GET", "/api/board")
    assert.equal(after.data.reports.length, 0)
    assert.equal(after.data.workplaces.length, 1)
  })
})

test("a signed-in filer can retract their own file without the receipt", async () => {
  await withServer(async ({ client }) => {
    await client.request("POST", "/api/auth/register", {
      email: "filer@example.com",
      password: "filer-password",
    })
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
    const mine = await client.request("GET", "/api/me/reports")
    assert.equal(mine.data.reports.length, 1)
    assert.equal(mine.data.reports[0].retracted, false)
    const retracted = await client.request("POST", "/api/me/reports/retract", {
      reportId: filed.data.report.id,
    })
    assert.equal(retracted.status, 200)
    const board = await client.request("GET", "/api/board")
    assert.equal(board.data.reports.length, 0)
    const listed = await client.request("GET", "/api/me/reports")
    assert.equal(listed.data.reports[0].retracted, true)
  })
})

test("bad passwords are refused and the chair account cannot be deleted", async () => {
  await withServer(async ({ client }) => {
    const weak = await client.request("POST", "/api/auth/register", {
      email: "short@example.com",
      password: "short",
    })
    assert.equal(weak.status, 400)
    await client.request("POST", "/api/auth/register", {
      email: "chair@example.com",
      password: "long-enough-password",
    })
    await client.request("POST", "/api/chair/claim", {})
    const removed = await client.request("POST", "/api/auth/delete", {
      email: "chair@example.com",
      password: "long-enough-password",
    })
    assert.equal(removed.status, 403)
    const me = await client.request("GET", "/api/auth/me")
    assert.equal(me.data.chair.mine, true)
  })
})

test("filing stays open without an account", async () => {
  await withServer(async ({ client }) => {
    const me = await client.request("GET", "/api/auth/me")
    assert.equal(me.data.user, null)
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
  })
})
