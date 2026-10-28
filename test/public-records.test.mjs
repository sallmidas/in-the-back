import assert from "node:assert/strict"
import { mkdtemp, readFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"
import { createStore, emptyStore } from "../server/store.mjs"
import { fetchDolDataset, recordsFromDolRows } from "../server/dol-records.mjs"
import {
  addressKey,
  applyPublicRecords,
  importPublicRows,
  rowsToRecords,
  visibleRecords,
} from "../server/public-records.mjs"
import { parseCsv, readTable } from "../server/tabular.mjs"
import { apiClient, withServer } from "./helpers.mjs"

const now = new Date("2026-10-28T00:00:00Z")

function workplace(id, name, city, street) {
  return {
    id,
    slug: id,
    name,
    industry: null,
    city,
    region: "MA",
    street,
    zip: "01103",
    createdAt: now.toISOString(),
    claimOnly: true,
  }
}

test("street and city match, and the same name in another city does not", () => {
  assert.equal(addressKey("10 Main St.", "Springfield"), addressKey("10 Main Street", "springfield"))
  assert.notEqual(addressKey("10 Main Street", "Springfield"), addressKey("10 Main Street", "Chicopee"))

  const data = emptyStore()
  data.workplaces.push(workplace("spring", "Dunkin", "Springfield", "10 Main Street"))
  data.workplaces.push(workplace("chicopee", "Dunkin", "Chicopee", "10 Main Street"))
  const parsed = rowsToRecords(
    [
      {
        record_id: "S",
        record_date: "2024-03-02",
        street: "10 Main St.",
        city: "Springfield",
        state: "MA",
        business_name: "Dunkin",
        summary: "Citation for overtime.",
        status: "open",
      },
      {
        record_id: "C",
        record_date: "2024-03-02",
        street: "10 Main Street",
        city: "Chicopee",
        state: "MA",
        business_name: "Dunkin",
        summary: "Citation for overtime.",
        status: "open",
      },
    ],
    "ma-ag",
  )
  applyPublicRecords(data, parsed.records, { now, maxAgeYears: 5 })
  const spring = data.publicRecords.find((record) => record.recordId === "S")
  const chicopee = data.publicRecords.find((record) => record.recordId === "C")
  assert.equal(spring.workplaceId, "spring")
  assert.equal(chicopee.workplaceId, "chicopee")
})

test("two places at one address stay unmatched", () => {
  const data = emptyStore()
  data.workplaces.push(workplace("a", "North Kitchen", "Springfield", "10 Main Street"))
  data.workplaces.push(workplace("b", "Other Kitchen", "Springfield", "10 Main Street"))
  const parsed = rowsToRecords(
    [
      {
        record_id: "BOTH",
        record_date: "2024-03-02",
        street: "10 Main Street",
        city: "Springfield",
        business_name: "North Kitchen",
        summary: "Citation for overtime.",
      },
    ],
    "ma-ag",
  )
  applyPublicRecords(data, parsed.records, { now, maxAgeYears: 5 })
  assert.equal(data.publicRecords[0].workplaceId, null)
})

test("import is idempotent, strips names, skips complaints, and archives stale rows", async () => {
  const csv = await readFile("test/fixtures/ma-ag-sample.csv", "utf8")
  const rows = parseCsv(csv)
  const parsed = rowsToRecords(rows, "ma-ag")
  assert.equal(parsed.records.some((record) => record.recordId === "FIXTURE-COMPLAINT"), false)
  assert.equal(parsed.records.some((record) => /maria|alvarez/i.test(record.summary)), false)
  assert.match(parsed.records.find((record) => record.recordId === "FIXTURE-AG-NAME").summary, /unpaid overtime/)

  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-records-"))
  const store = createStore(path.join(dir, "board.json"))
  const first = await importPublicRows(store, rows, "ma-ag", { now, maxAgeYears: 5 })
  assert.equal(first.added, 3)
  await store.update((current) => {
    current.workplaces.push({
      id: "keep-me",
      slug: "keep-me",
      name: "Kept",
      city: "Holyoke",
      region: "MA",
      street: "1 Other Road",
      zip: "",
      createdAt: now.toISOString(),
    })
    current.publicRecords.find((record) => record.recordId === "FIXTURE-AG-1").workplaceId = "keep-me"
    return null
  })
  const second = await importPublicRows(store, rows, "ma-ag", { now, maxAgeYears: 5 })
  assert.equal(second.added, 0)
  assert.equal(second.updated, 3)
  const after = await store.read()
  assert.equal(after.publicRecords.length, 3)
  assert.equal(after.publicRecords.find((record) => record.recordId === "FIXTURE-AG-1").workplaceId, "keep-me")
  const visible = visibleRecords(after, now, 5).map((record) => record.recordId)
  assert.equal(visible.includes("FIXTURE-AG-OLD"), false)
  assert.equal(visible.includes("FIXTURE-AG-1"), true)
  assert.ok(after.publicRecords.find((record) => record.recordId === "FIXTURE-AG-OLD").archivedAt)
})

test("a complaints export is refused and an xlsx citation file imports", async () => {
  const complaints = rowsToRecords(
    [{ "complaint number": "9", complainant: "Ana", "complaint date": "2024-01-01", city: "Springfield" }],
    "ma-ag",
  )
  assert.match(complaints.error, /complaints/i)

  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-xlsx-"))
  const file = path.join(dir, "citations.xlsx")
  const built = spawnSync(
    "python3",
    [
      "-c",
      `
import zipfile
from pathlib import Path
p = Path(${JSON.stringify(file)})
shared = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="8" uniqueCount="8">
<si><t>record_id</t></si><si><t>citation_date</t></si><si><t>street</t></si><si><t>city</t></si>
<si><t>business_name</t></si><si><t>summary</t></si><si><t>FIXTURE-XLSX</t></si>
<si><t>SAMPLE FIXTURE. Not an agency record.</t></si>
</sst>"""
sheet = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c><c r="F1" t="s"><v>5</v></c></row>
<row r="2"><c r="A2" t="s"><v>6</v></c><c r="B2"><v>45384</v></c><c r="C2" t="inlineStr"><is><t>22 Elm St</t></is></c><c r="D2" t="inlineStr"><is><t>Chicopee</t></is></c><c r="E2" t="inlineStr"><is><t>Fixture Diner</t></is></c><c r="F2" t="s"><v>7</v></c></row>
</sheetData></worksheet>"""
with zipfile.ZipFile(p, "w") as z:
    z.writestr("xl/sharedStrings.xml", shared)
    z.writestr("xl/worksheets/sheet1.xml", sheet)
`,
    ],
    { encoding: "utf8" },
  )
  assert.equal(built.status, 0, built.stderr)
  const table = await readTable(file)
  assert.equal(table[0].record_id, "FIXTURE-XLSX")
  assert.equal(table[0].city, "Chicopee")
  const parsed = rowsToRecords(table, "health")
  assert.equal(parsed.records.length, 1)
  assert.equal(parsed.records[0].city, "Chicopee")
})

test("DOL pulls stay local to Springfield and Chicopee food and retail, and a missing key writes nothing", async () => {
  let called = false
  const missed = await fetchDolDataset({
    source: "osha",
    key: "",
    fetchImpl: () => {
      called = true
      throw new Error("should not download")
    },
  })
  assert.equal(missed.ok, false)
  assert.equal(missed.reason, "missing-key")
  assert.equal(called, false)
  assert.match(missed.message, /DOL_API_KEY/)

  const parsed = recordsFromDolRows(
    [
      {
        activity_nr: "100",
        open_date: "2024-06-01",
        site_address: "10 Main St",
        site_city: "Springfield",
        site_state: "MA",
        site_zip: "01103",
        estab_name: "North Kitchen",
        naics_code: "722511",
        standard: "Walking-working surfaces.",
      },
      {
        activity_nr: "200",
        open_date: "2024-06-01",
        site_address: "1 State St",
        site_city: "Boston",
        site_state: "MA",
        site_zip: "02108",
        estab_name: "Boston Grill",
        naics_code: "722511",
        standard: "Walking-working surfaces.",
      },
      {
        activity_nr: "300",
        open_date: "2024-06-01",
        site_address: "5 Carew St",
        site_city: "Springfield",
        site_state: "MA",
        site_zip: "01104",
        estab_name: "Mill Works",
        naics_code: "311111",
        standard: "Machine guarding.",
      },
    ],
    "osha",
  )
  assert.deepEqual(
    parsed.records.map((record) => record.recordId),
    ["100"],
  )
  assert.match(parsed.records[0].sourceUrl, /osha\.gov/)
})

test("the chair can place a record and a reader can report an error", async () => {
  await withServer(async ({ base, client, storePath }) => {
    const csv = parseCsv(await readFile("test/fixtures/ma-ag-sample.csv", "utf8"))
    const imported = await importPublicRows(createStore(storePath), csv, "ma-ag", { now, maxAgeYears: 5 })
    assert.equal(imported.status, 200)

    const anon = await client.request("GET", "/api/chair/public-records")
    assert.equal(anon.status, 401)
    const boardBefore = await client.request("GET", "/api/board")
    const packed = JSON.stringify(boardBefore.data)
    assert.equal(/maria|alvarez/i.test(packed), false)
    assert.equal(boardBefore.data.publicRecords.some((record) => record.recordId === "FIXTURE-AG-OLD"), false)
    assert.equal(boardBefore.data.publicRecords.some((record) => record.recordId === "FIXTURE-AG-1"), true)

    const reader = apiClient(base)
    await reader.request("POST", "/api/auth/register", {
      email: "reader@example.com",
      password: "reader-password",
    })
    const refused = await reader.request("POST", "/api/chair/public-records/place", {
      id: boardBefore.data.publicRecords[0].id,
    })
    assert.equal(refused.status, 403)

    const record = boardBefore.data.publicRecords.find((item) => item.recordId === "FIXTURE-AG-1")
    const note = await client.request("POST", "/api/public-records/error", {
      recordId: record.id,
      note: "The street number is wrong. Maria Alvarez",
    })
    assert.equal(note.status, 200)

    const chair = apiClient(base)
    await chair.request("POST", "/api/auth/register", {
      email: "chair@example.com",
      password: "chair-password",
    })
    await chair.request("POST", "/api/chair/claim", {})
    const queue = await chair.request("GET", "/api/chair/public-records")
    assert.equal(queue.status, 200)
    assert.ok(queue.data.records.some((item) => item.recordId === "FIXTURE-AG-1"))
    const errors = await chair.request("GET", "/api/chair/record-errors")
    assert.equal(errors.status, 200)
    assert.equal(/maria|alvarez/i.test(JSON.stringify(errors.data)), false)
    assert.match(errors.data.errors[0].note, /street number/i)

    const placed = await chair.request("POST", "/api/chair/public-records/place", { id: record.id })
    assert.equal(placed.status, 200)
    assert.equal(placed.data.record.workplaceSlug?.length > 0, true)
    const board = await client.request("GET", "/api/board")
    const linked = board.data.publicRecords.find((item) => item.recordId === "FIXTURE-AG-1")
    assert.equal(linked.workplaceSlug, placed.data.record.workplaceSlug)
    assert.ok(board.data.workplaces.some((place) => place.slug === linked.workplaceSlug))
    const closed = await chair.request("POST", "/api/chair/record-errors/close", {
      id: errors.data.errors[0].id,
    })
    assert.equal(closed.status, 200)
    const remaining = await chair.request("GET", "/api/chair/record-errors")
    assert.equal(remaining.data.errors.length, 0)
  })
})

test("the app does not load the fixture file on its own", async () => {
  const server = await readFile("server/index.mjs", "utf8")
  const app = await readFile("server/app.mjs", "utf8")
  assert.equal(server.includes("test/fixtures"), false)
  assert.equal(app.includes("FIXTURE-AG"), false)
})
