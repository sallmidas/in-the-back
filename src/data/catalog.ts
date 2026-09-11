import { isDemoSeedEnabled } from "./demo-flag"
import { DEMO_REPORTS, DEMO_WORKPLACES } from "./seed"
import {
  ROOM_LABELS,
  type Industry,
  type Report,
  type RoomKind,
  type Workplace,
} from "./types"

export type DirectoryFilters = {
  query?: string
  industry?: Industry | "all"
  room?: RoomKind | "all"
  band?: "all" | "struggling" | "mixed" | "solid"
}

export type ReportWithWorkplace = Report & { workplace: Workplace }

const workplaceById = new Map(DEMO_WORKPLACES.map((workplace) => [workplace.id, workplace]))
const workplaceBySlug = new Map(DEMO_WORKPLACES.map((workplace) => [workplace.slug, workplace]))

const reportsByWorkplaceId = new Map<string, Report[]>()
for (const report of DEMO_REPORTS) {
  const list = reportsByWorkplaceId.get(report.workplaceId)
  if (list) list.push(report)
  else reportsByWorkplaceId.set(report.workplaceId, [report])
}
for (const list of reportsByWorkplaceId.values()) {
  list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

const sortedReports: ReportWithWorkplace[] = DEMO_REPORTS.filter(
  (report) => workplaceById.has(report.workplaceId),
)
  .map((report) => ({
    ...report,
    workplace: workplaceById.get(report.workplaceId)!,
  }))
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

const disputed = sortedReports.filter((report) => report.disputed)

function emptySeed() {
  return !isDemoSeedEnabled()
}

export function getWorkplaces(): Workplace[] {
  if (emptySeed()) return []
  return DEMO_WORKPLACES
}

export function getReports(): Report[] {
  if (emptySeed()) return []
  return DEMO_REPORTS
}

export function getWorkplaceBySlug(slug: string): Workplace | undefined {
  if (emptySeed()) return undefined
  return workplaceBySlug.get(slug)
}

export function getWorkplaceById(id: string): Workplace | undefined {
  if (emptySeed()) return undefined
  return workplaceById.get(id)
}

export function reportsForWorkplace(workplaceId: string): Report[] {
  if (emptySeed()) return []
  return reportsByWorkplaceId.get(workplaceId) ?? []
}

export function recentReports(limit = 8): ReportWithWorkplace[] {
  if (emptySeed()) return []
  return sortedReports.slice(0, limit)
}

export function disputedReports(): ReportWithWorkplace[] {
  if (emptySeed()) return []
  return disputed
}

export function overallScore(workplace: Workplace): number {
  if (workplace.rooms.length === 0) return 0
  const sum = workplace.rooms.reduce((acc, room) => acc + room.score, 0)
  return Math.round((sum / workplace.rooms.length) * 10) / 10
}

export function filterWorkplaces(filters: DirectoryFilters): Workplace[] {
  const query = filters.query?.trim().toLowerCase() ?? ""
  const industry = filters.industry ?? "all"
  const room = filters.room ?? "all"
  const band = filters.band ?? "all"

  return getWorkplaces().filter((workplace) => {
    if (query) {
      const rooms = workplace.rooms.map((item) => ROOM_LABELS[item.kind]).join(" ")
      const haystack =
        `${workplace.name} ${workplace.city} ${workplace.region} ${workplace.blurb} ${rooms}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (industry !== "all" && workplace.industry !== industry) return false
    if (room !== "all" && !workplace.rooms.some((item) => item.kind === room)) return false
    if (band !== "all") {
      const score = overallScore(workplace)
      if (band === "struggling" && score > 4.5) return false
      if (band === "mixed" && (score <= 4.5 || score >= 7.5)) return false
      if (band === "solid" && score < 7.5) return false
    }
    return true
  })
}
