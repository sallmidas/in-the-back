import assert from "node:assert/strict"
import { mkdtemp } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { createStore } from "../server/store.mjs"
import { importPublicRows } from "../server/public-records.mjs"
import { findingTotal, parseOshaCitations, parseWhdFindings, plainTopic } from "../server/plain-findings.mjs"

const SAMPLE =
  "OSHA cited: Citation 01001: Serious - 29 CFR 1910.212(a)(1) (penalty $4,688), issued 2023-10-31; Citation 02001: Other-than-serious - 29 CFR 1903.19(c)(1) (penalty $388), issued 2024-02-29; Citation 03001: Willful - 29 CFR 1910.147(c)(1) (penalty $10,000), issued 2023-10-31; Citation 04001: Repeat - 5(a)(1) (penalty $5,000), issued 2023-10-31; Citation 05001: Serious - 29 CFR 1910.9999(a) (penalty $100), issued 2023-10-31"

test("OSHA citations become plain lines and unknown rules keep the number", () => {
  const items = parseOshaCitations(SAMPLE)
  assert.equal(items.length, 5)
  assert.equal(
    items[0].detail,
    "machines missing safety guards, $4,688 fine (issued 2023-10-31)",
  )
  assert.equal(items[0].label, "Serious (could cause serious injury)")
  assert.match(items[0].standard, /1910\.212/)
  assert.equal(items[1].label, "Minor")
  assert.match(items[1].detail, /not showing proof hazards were fixed/)
  assert.equal(items[2].label, "Willful: knowingly ignored the rule")
  assert.match(items[2].detail, /lockout\/tagout/)
  assert.equal(items[3].label, "Repeat: same violation cited before")
  assert.match(items[3].detail, /General Duty Clause/)
  assert.match(items[4].detail, /Safety rule violation \(29 CFR 1910\.9999/)
  assert.equal(plainTopic("29 CFR 1926.501(b)(13)"), "fall protection")
  assert.match(findingTotal(items, { penalty: "20176" }), /5 items/)
  assert.match(findingTotal(items, { penalty: "20176" }), /\$20,176 in fines/)
})

test("a wage case names the law, the workers, and the back wages", () => {
  const summary =
    "WHD found Fair Labor Standards Act (minimum wage/overtime): 11 violation(s), back wages $5,000.00 (minimum wage $0.00; overtime $5,000.00). Back wages agreed to pay: $5,000.00 for 10 employee(s). Civil money penalties assessed: $16,610.00. WHD found FLSA child labor: 9 violation(s), minors employed in violation: 6."
  const items = parseWhdFindings(summary, { workers: "10", backWages: "5000", penalty: "16610", violations: "20" })
  assert.match(items[0].label, /Minimum wage and overtime/)
  assert.match(items[0].detail, /11 violations/)
  assert.match(items[0].detail, /\$5,000 back wages/)
  assert.match(items[0].detail, /10 workers/)
  assert.match(items[1].label, /Child labor/)
  assert.match(items[1].detail, /6 minors/)
  assert.match(findingTotal(items, { backWages: "5000", penalty: "16610", violations: "20" }), /\$5,000 back wages/)
  assert.match(findingTotal(items, { backWages: "5000", penalty: "16610", violations: "20" }), /\$16,610 in fines/)
})

test("re-import replaces the stored citation lines", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "itb-plain-"))
  const store = createStore(path.join(dir, "board.json"))
  const row = {
    record_id: "PLAIN-1",
    record_date: "2024-06-01",
    business_name: "North Kitchen",
    street: "10 Main Street",
    city: "Springfield",
    state: "MA",
    zip: "01103",
    naics: "722511",
    summary: "OSHA cited: Citation 01001: Serious - 29 CFR 1910.178(l)(1) (penalty $1,000), issued 2024-06-01",
    penalty: "1000",
    violation_items: "1",
  }
  await importPublicRows(store, [row], "osha", { now: new Date("2026-10-28T00:00:00Z"), maxAgeYears: 5 })
  row.summary = "OSHA cited: Citation 01001: Serious - 29 CFR 1910.1200(e)(1) (penalty $2,000), issued 2024-07-01"
  row.penalty = "2000"
  const again = await importPublicRows(store, [row], "osha", { now: new Date("2026-10-28T00:00:00Z"), maxAgeYears: 5 })
  assert.equal(again.updated, 1)
  assert.equal(again.added, 0)
  const saved = await store.read()
  assert.equal(saved.publicRecords.length, 1)
  assert.match(saved.publicRecords[0].items[0].detail, /chemical hazard labels and training/)
  assert.match(saved.publicRecords[0].items[0].detail, /\$2,000 fine/)
})
