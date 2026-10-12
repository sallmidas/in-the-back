import { compareRooms } from "./constants.mjs"

/**
 * Join the labeled demo catalog (client-only, empty when the seed is off)
 * with filings stored on the server. Demo room scores stay as seeded.
 * A live workplace's room scores are the average of its published files.
 */
export function mergeBoard({ demoWorkplaces, demoReports, liveWorkplaces, liveReports }) {
  const workplaces = (demoWorkplaces ?? []).map((workplace) => ({
    ...workplace,
    rooms: (workplace.rooms ?? []).map((room) => ({ ...room })),
  }))
  const bySlug = new Map(workplaces.map((workplace) => [workplace.slug, workplace]))

  for (const workplace of liveWorkplaces ?? []) {
    if (bySlug.has(workplace.slug)) continue
    const copy = { ...workplace, demo: false, rooms: [] }
    workplaces.push(copy)
    bySlug.set(copy.slug, copy)
  }

  const reports = (demoReports ?? []).map((report) => ({ ...report }))

  for (const report of liveReports ?? []) {
    let workplace = bySlug.get(report.workplaceSlug)
    if (!workplace) {
      workplace = {
        id: `live-${report.workplaceSlug}`,
        slug: report.workplaceSlug,
        name: report.workplaceName,
        industry: report.workplaceIndustry,
        city: report.workplaceCity || "",
        region: report.workplaceRegion || "",
        blurb: "",
        rooms: [],
        listedPlan: "free",
        demo: false,
      }
      workplaces.push(workplace)
      bySlug.set(workplace.slug, workplace)
    }
    reports.push({
      id: report.id,
      workplaceId: workplace.id,
      roomKind: report.roomKind,
      score: report.score,
      context: report.context,
      excerpt: report.excerpt,
      publishedAt: report.publishedAt,
      disputed: Boolean(report.disputed),
    })
  }

  for (const workplace of workplaces) {
    if (workplace.demo) continue
    const scores = new Map()
    for (const report of reports) {
      if (report.workplaceId !== workplace.id) continue
      const list = scores.get(report.roomKind) ?? []
      list.push(report.score)
      scores.set(report.roomKind, list)
    }
    workplace.rooms = [...scores.entries()]
      .map(([kind, list]) => ({
        kind,
        score: Math.round((list.reduce((sum, value) => sum + value, 0) / list.length) * 10) / 10,
      }))
      .sort((a, b) => compareRooms(a.kind, b.kind))
  }

  return { workplaces, reports }
}
