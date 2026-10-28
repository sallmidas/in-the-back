import assert from "node:assert/strict"
import test from "node:test"
import {
  citationCount,
  directoryTowns,
  filterAndSortWorkplaces,
  recordChip,
  wageCaseCount,
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
  const byHigh = filterAndSortWorkplaces(places, records, { sort: "high" })
  assert.deepEqual(byHigh.map((place) => place.id), ["c", "a", "b", "d"])
  const byLow = filterAndSortWorkplaces(places, records, { sort: "low" })
  assert.deepEqual(byLow.map((place) => place.id), ["a", "c", "b", "d"])
})

test("rating sort puts unrated places last and keeps the band filter", () => {
  const rated = [
    { id: "low", name: "Low Place", city: "Springfield", rooms: [{ kind: "kitchen", score: 3 }] },
    { id: "none", name: "No Filings", city: "Springfield", rooms: [] },
    { id: "bee", name: "Bee Cafe", city: "Holyoke", rooms: [{ kind: "kitchen", score: 9 }] },
    { id: "aye", name: "Aye Cafe", city: "Holyoke", rooms: [{ kind: "kitchen", score: 9 }] },
  ]
  const high = filterAndSortWorkplaces(rated, [], { sort: "high" })
  assert.deepEqual(high.map((place) => place.id), ["aye", "bee", "low", "none"])
  const low = filterAndSortWorkplaces(rated, [], { sort: "low" })
  assert.deepEqual(low.map((place) => place.id), ["low", "aye", "bee", "none"])
  const struggling = filterAndSortWorkplaces(rated, [], { band: "struggling" })
  assert.deepEqual(struggling.map((place) => place.id), ["low"])
  const solid = filterAndSortWorkplaces(rated, [], { band: "solid" })
  assert.deepEqual(solid.map((place) => place.id), ["aye", "bee"])
})

test("directory chips stay neutral summaries", () => {
  assert.equal(recordChip(places[0], records), "3 citations · $1,000")
  assert.equal(recordChip(places[1], records), "Passed inspection 2025")
  assert.equal(recordChip(places[2], records), "3 citations · $17,349")
  assert.equal(recordChip(places[3], records), "No public records found")
  assert.equal(/shame|worst|dirty|bad/i.test(recordChip(places[0], records)), false)
  const cana = { id: "w", slug: "cana" }
  const wage = [
    {
      workplaceId: "w",
      sourceAgency: "whd",
      outcome: "finding",
      backWages: 52953.72,
      penalty: 864,
      items: [{}, {}],
    },
  ]
  assert.equal(wageCaseCount(wage), 1)
  assert.equal(citationCount(wage), 0)
  assert.equal(recordChip(cana, wage), "1 wage case · $52,953.72 back wages · $864 fines")
  const mixed = [
    { workplaceId: "w", sourceAgency: "osha", outcome: "finding", penalty: 1000, items: [{}, {}] },
    { workplaceId: "w", sourceAgency: "ma-ag", outcome: "finding", backWages: 50, penalty: 0 },
  ]
  assert.equal(recordChip(cana, mixed), "2 citations · $1,000 · 1 wage case · $50 back wages")
})
