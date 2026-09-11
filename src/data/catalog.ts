import { isDemoSeedEnabled } from "./demo-flag"
import { DEMO_REPORTS, DEMO_WORKPLACES } from "./seed"
import type { Industry, Report, RoomKind, Workplace } from "./types"

export type DirectoryFilters = {
  query?: string
  industry?: Industry | "all"
  room?: RoomKind | "all"
  band?: "all" | "struggling" | "mixed" | "solid"
}

export function getWorkplaces(): Workplace[] {
  if (!isDemoSeedEnabled()) return []
  return DEMO_WORKPLACES
}

export function getReports(): Report[] {
  if (!isDemoSeedEnabled()) return []
  return DEMO_REPORTS
}

export function getWorkplaceBySlug(slug: string): Workplace | undefined {
  return getWorkplaces().find((w) => w.slug === slug)
}

export function getWorkplaceById(id: string): Workplace | undefined {
  return getWorkplaces().find((w) => w.id === id)
}

export function reportsForWorkplace(workplaceId: string): Report[] {
  return getReports()
    .filter((r) => r.workplaceId === workplaceId)
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function recentReports(limit = 24): Array<Report & { workplace: Workplace }> {
  const workplaces = new Map(getWorkplaces().map((w) => [w.id, w]))
  return getReports()
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .flatMap((report) => {
      const workplace = workplaces.get(report.workplaceId)
      if (!workplace) return []
      return [{ ...report, workplace }]
    })
    .slice(0, limit)
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
      const haystack = `${workplace.name} ${workplace.city} ${workplace.region} ${workplace.blurb}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (industry !== "all" && workplace.industry !== industry) return false
    if (room !== "all" && !workplace.rooms.some((r) => r.kind === room)) return false
    if (band !== "all") {
      const score = overallScore(workplace)
      if (band === "struggling" && score > 4.5) return false
      if (band === "mixed" && (score <= 4.5 || score >= 7.5)) return false
      if (band === "solid" && score < 7.5) return false
    }
    return true
  })
}
