import assert from "node:assert/strict"
import test from "node:test"
import { mergeBoard } from "../shared/merge-board.mjs"

const demoWorkplace = {
  id: "wp-harbor-rye",
  slug: "harbor-and-rye",
  name: "Harbor & Rye",
  industry: "restaurant",
  city: "Portland",
  region: "OR",
  blurb: "Demo",
  rooms: [{ kind: "walk-in", score: 3.2 }],
  listedPlan: "respond",
  demo: true,
}

test("a filed report joins a demo workplace and a new workplace stands alone", () => {
  const merged = mergeBoard({
    demoWorkplaces: [demoWorkplace],
    demoReports: [
      {
        id: "rpt-harbor-01",
        workplaceId: "wp-harbor-rye",
        roomKind: "walk-in",
        score: 3,
        context: "Tuesday close",
        excerpt: "Seeded.",
        publishedAt: "2026-09-10T08:12:00.000Z",
        disputed: true,
      },
    ],
    liveWorkplaces: [
      {
        id: "wp_live",
        slug: "north-kitchen",
        name: "North Kitchen",
        industry: "restaurant",
        city: "Cicero",
        region: "IL",
        blurb: "",
        rooms: [],
        listedPlan: "free",
        demo: false,
      },
    ],
    liveReports: [
      {
        id: "rpt_live_demo",
        workplaceSlug: "harbor-and-rye",
        workplaceName: "Harbor & Rye",
        roomKind: "dish-pit",
        score: 2,
        context: "Thursday night",
        excerpt: "Pit flooded.",
        publishedAt: "2026-10-12T12:00:00.000Z",
        disputed: false,
      },
      {
        id: "rpt_live_new",
        workplaceSlug: "north-kitchen",
        workplaceName: "North Kitchen",
        roomKind: "walk-in",
        score: 4,
        context: "Tuesday close",
        excerpt: "Warm box.",
        publishedAt: "2026-10-12T12:05:00.000Z",
        disputed: false,
      },
    ],
  })

  const harbor = merged.workplaces.find((workplace) => workplace.slug === "harbor-and-rye")
  assert.equal(harbor.demo, true)
  assert.equal(harbor.rooms[0].score, 3.2)
  const harborReports = merged.reports.filter((report) => report.workplaceId === harbor.id)
  assert.equal(harborReports.length, 2)
  assert.equal(harborReports.some((report) => report.id === "rpt_live_demo"), true)

  const north = merged.workplaces.find((workplace) => workplace.slug === "north-kitchen")
  assert.equal(north.demo, false)
  assert.deepEqual(north.rooms, [{ kind: "walk-in", score: 4 }])
})
