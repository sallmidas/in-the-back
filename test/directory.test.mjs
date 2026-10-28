import assert from "node:assert/strict"
import test from "node:test"
import {
  citationCount,
  directoryTowns,
  filterAndSortWorkplaces,
  recordChip,
} from "../shared/directory.mjs"

const places = [
  { id: "a", slug: "alpha", name: "Alpha Cafe", city: "Springfield", region: "MA", industryLabel: "Restaurant/Food service", rooms: [{ kind: "kitchen", score: 6 }] },
  { id: "b", slug: "beta", name: "Beta Metals", city: "Holyoke", region: "MA", industryLabel: "Manufacturing", rooms: [] },
  { id: "c", slug: "gamma", name: "Gamma Grocery", city: "Springfield", region: "MA", industryLabel: "Grocery", rooms: [{ kind: "stock", score: 8 }] },
  { id: "d", slug: "delta", name: "Delta Warehouse", city: "Chicopee", region: "MA", industry: "logistics", rooms: [] },
]

const records = [
  { workplaceId: "a", outcome: "finding", recordDate: "2024-01-01", penalty: 1000, backWages: 0, items: [{}, {}, {}] },
  { workplaceId: "b", outcome: "clear", sourceAgency: "osha", recordDate: "2025-02-28", penalty: 0, backWages: 0 },
  { workplaceId: "c", outcome: "finding", recordDate: "2023-06-01", penalty: 16849, backWages: 0, items: [{}, {}] },
  { workplaceId: "c", outcome: "finding", recordDate: "2024-06-01", penalty: 0, backWages: 500, items: [{}] },
]

test("directory filters and sorts public records", () => {
  assert.deepEqual(directoryTowns(places), ["Chicopee", "Holyoke", "Springfield"])
  const citations = filterAndSortWorkplaces(places, records, { records: "citations" })
  assert.deepEqual(citations.map((place) => place.id), ["a", "c"])
  const good = filterAndSortWorkplaces(places, records, { records: "good" })
  assert.deepEqual(good.map((place) => place.id), ["b"])
  const none = filterAndSortWorkplaces(places, records, { records: "none", town: "Chicopee" })
  assert.deepEqual(none.map((place) => place.id), ["d"])
  const food = filterAndSortWorkplaces(places, records, { industry: "food-service" })
  assert.deepEqual(food.map((place) => place.id), ["a"])
  const transport = filterAndSortWorkplaces(places, records, { industry: "transport" })
  assert.deepEqual(transport.map((place) => place.id), ["d"])
  const byMoney = filterAndSortWorkplaces(places, records, { sort: "money" })
  assert.equal(byMoney[0].id, "c")
  const byCitations = filterAndSortWorkplaces(places, records, { sort: "citations" })
  assert.equal(byCitations[0].id, "a")
  assert.equal(citationCount(records.filter((record) => record.workplaceId === "a")), 3)
  const byRecent = filterAndSortWorkplaces(places, records, { sort: "recent" })
  assert.equal(byRecent[0].id, "b")
  const byName = filterAndSortWorkplaces(places, records, {})
  assert.deepEqual(byName.map((place) => place.name), ["Alpha Cafe", "Beta Metals", "Delta Warehouse", "Gamma Grocery"])
})

test("directory chips stay neutral summaries", () => {
  assert.equal(recordChip(places[0], records), "3 citations · $1,000")
  assert.equal(recordChip(places[1], records), "Passed inspection 2025")
  assert.equal(recordChip(places[2], records), "3 citations · $17,349")
  assert.equal(recordChip(places[3], records), "No public records found")
  assert.equal(/shame|worst|dirty|bad/i.test(recordChip(places[0], records)), false)
})
