import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { createStore, emptyStore } from "../server/store.mjs"
import { mkdtemp } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { clearSummary, importPublicRows, normalizeBusinessName, rowsToRecords } from "../server/public-records.mjs"
import { parseCsv } from "../server/tabular.mjs"
import { apiClient, sampleFiling, withServer } from "./helpers.mjs"

const now = new Date("2026-10-28T00:00:00Z")

test("a closed inspection with no citations is good news and does not say clean", () => {
  const parsed = rowsToRecords(
    [
      {
        record_id: "CLEAR-1",
        record_date: "2025-02-28",
        business_name: "Fixture Cafe",
        street: "8 Fenn St",
        city: "Pittsfield",
        state: "MA",
        zip: "01201",
        naics: "722511",
        record_type: "inspection",
        inspection_reason: "Complaint",
        status: "closed",
        violation_items: "0",
        penalty: "0",
        summary: "",
      },
    ],
    "osha",
  )
  assert.equal(parsed.records.length, 1)
  assert.equal(parsed.records[0].outcome, "clear")
  assert.equal(parsed.records[0].summary, "OSHA inspection, 2025-02-28: no citations issued.")
  assert.equal(/clean/i.test(parsed.records[0].summary), false)
  assert.equal(clearSummary("whd", "2024-01-02"), "Wage and Hour case, 2024-01-02: no violations found.")
})

test("the same business with Inc and LLC shares one place", async () => {
  assert.equal(normalizeBusinessName("North Kitchen, Inc."), normalizeBusinessName("NORTH KITCHEN LLC"))
  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-dedupe-"))
  const store = createStore(path.join(dir, "board.json"))
  const rows = [
    {
      record_id: "A",
      record_date: "2024-06-01",
      business_name: "North Kitchen, Inc.",
      street: "10 Main Street",
      city: "Springfield",
      state: "MA",
      zip: "01103",
      naics: "722511",
      summary: "OSHA cited: Citation 01001.",
      penalty: "100",
      violation_items: "1",
    },
    {
      record_id: "B",
      record_date: "2024-07-01",
      business_name: "NORTH KITCHEN LLC",
      street: "10 Main St.",
      city: "Springfield",
      state: "MA",
      zip: "01103",
      naics: "722511",
      status: "closed",
      violation_items: "0",
      penalty: "0",
      summary: "",
    },
  ]
  const result = await importPublicRows(store, rows, "osha", { now, maxAgeYears: 5 })
  assert.equal(result.added, 2)
  const data = await store.read()
  assert.equal(data.workplaces.length, 1)
  assert.equal(data.publicRecords[0].workplaceId, data.publicRecords[1].workplaceId)
  assert.equal(data.publicRecords.find((record) => record.recordId === "B").outcome, "clear")
  const untouched = emptyStore()
  assert.equal(untouched.publicRecords.length, 0)
})

test("a recognition list imports and an owner award waits for approval", async () => {
  const csv = parseCsv(await readFile("test/fixtures/recognition.csv", "utf8"))
  const parsed = rowsToRecords(csv, "osha-vpp-sharp")
  assert.equal(parsed.records.length, 1)
  assert.equal(parsed.records[0].outcome, "recognition")
  assert.match(parsed.records[0].summary, /SHARP, 2024/)
  assert.equal(/clean/i.test(parsed.records[0].summary), false)

  await withServer(async ({ base, client, storePath }) => {
    await importPublicRows(createStore(storePath), csv, "osha-vpp-sharp", { now, maxAgeYears: 5 })
    const store = apiClient(base)
    await store.request("POST", "/api/auth/register", {
      email: "desk@fixture.example",
      password: "store-password",
      kind: "store",
    })
    const claim = await store.request("POST", "/api/store/claims", {
      businessName: "Fixture Bakery",
      role: "Manager",
      workEmail: "desk@fixture.example",
    })
    assert.equal(claim.status, 201)
    const early = await store.request("POST", "/api/store/awards", {
      title: "Local safety award",
      year: "2024",
      proofUrl: "https://example.com/award",
    })
    assert.equal(early.status, 403)

    const chair = apiClient(base)
    await chair.request("POST", "/api/auth/register", {
      email: "chair@example.com",
      password: "chair-password",
    })
    await chair.request("POST", "/api/chair/claim", {})
    await chair.request("POST", "/api/chair/store-claims/approve", { claimId: claim.data.claim.id })

    const sent = await store.request("POST", "/api/store/awards", {
      title: "Local safety award",
      year: "2024",
      proofUrl: "https://example.com/award",
    })
    assert.equal(sent.status, 201)
    const hidden = await client.request("GET", "/api/board")
    assert.equal((hidden.data.ownerAwards ?? []).length, 0)
    const queue = await chair.request("GET", "/api/chair/owner-awards")
    assert.equal(queue.data.awards.length, 1)
    await chair.request("POST", "/api/chair/owner-awards/approve", { id: queue.data.awards[0].id })
    const board = await client.request("GET", "/api/board")
    assert.equal(board.data.ownerAwards[0].label, "Added by owner, verified by moderator")
    assert.equal(board.data.ownerAwards[0].title, "Local safety award")
  })
})

test("a shout-out is a filing and an owner reply cannot remove the record", async () => {
  await withServer(async ({ base, client, storePath }) => {
    await importPublicRows(
      createStore(storePath),
      [
        {
          record_id: "CITE-1",
          record_date: "2024-06-01",
          business_name: "North Kitchen",
          street: "10 Main Street",
          city: "Springfield",
          state: "MA",
          zip: "01103",
          naics: "722511",
          summary: "OSHA cited: Citation 01001.",
          penalty: "100",
          violation_items: "1",
        },
      ],
      "osha",
      { now, maxAgeYears: 5 },
    )
    const filed = await client.request("POST", "/api/reports", { ...sampleFiling, kind: "shout-out", score: 9 })
    assert.equal(filed.status, 201)
    assert.equal(filed.data.report.kind, "shout-out")

    const recordId = (await client.request("GET", "/api/board")).data.publicRecords[0].id
    const store = apiClient(base)
    await store.request("POST", "/api/auth/register", {
      email: "desk@north.example",
      password: "store-password",
      kind: "store",
    })
    const claim = await store.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "Manager",
      workEmail: "desk@north.example",
    })
    const chair = apiClient(base)
    await chair.request("POST", "/api/auth/register", {
      email: "chair2@example.com",
      password: "chair-password",
    })
    await chair.request("POST", "/api/chair/claim", {})
    await chair.request("POST", "/api/chair/store-claims/approve", { claimId: claim.data.claim.id })
    const reply = await store.request("POST", "/api/store/record-replies", {
      recordId,
      text: "We fixed the guard the next week.",
    })
    assert.equal(reply.status, 201)
    const before = await client.request("GET", "/api/board")
    assert.equal(before.data.publicRecords[0].reply, null)
    const waiting = await chair.request("GET", "/api/chair/record-replies")
    await chair.request("POST", "/api/chair/record-replies/approve", { id: waiting.data.replies[0].id })
    const after = await client.request("GET", "/api/board")
    assert.equal(after.data.publicRecords[0].reply, "We fixed the guard the next week.")
    const removed = await store.request("DELETE", `/api/public-records/${recordId}`)
    assert.equal(removed.status, 404)
    const still = await client.request("GET", "/api/board")
    assert.equal(still.data.publicRecords.length, 1)
  })
})
