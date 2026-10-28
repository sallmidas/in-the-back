import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { mergeBoard } from "../../shared/merge-board.mjs"
import {
  getReports,
  getWorkplaces,
  type DirectoryFilters,
  type ReportWithWorkplace,
} from "@/data/catalog"
import { filterAndSortWorkplaces } from "../../shared/directory.mjs"
import { isIndustry, isRoomKind, type Report, type Workplace } from "@/data/types"
import { getBoard, type BoardPayload, type OwnerAward, type PublicRecord } from "@/lib/api"

type BoardValue = {
  ready: boolean
  error: string | null
  workplaces: Workplace[]
  reports: ReportWithWorkplace[]
  publicRecords: PublicRecord[]
  ownerAwards: OwnerAward[]
  refresh: () => Promise<void>
  workplaceBySlug: (slug: string) => Workplace | undefined
  reportsForWorkplace: (workplaceId: string) => Report[]
  recentReports: (limit?: number) => ReportWithWorkplace[]
  disputedReports: () => ReportWithWorkplace[]
  filterWorkplaces: (filters: DirectoryFilters) => Workplace[]
}

const BoardContext = createContext<BoardValue | null>(null)

function asWorkplace(value: unknown): Workplace | null {
  if (!value || typeof value !== "object") return null
  const workplace = value as Workplace
  if (!workplace.id || !workplace.slug || !workplace.name) return null
  return {
    ...workplace,
    industry: workplace.industry && isIndustry(workplace.industry) ? workplace.industry : null,
    industryLabel: workplace.industryLabel || "",
    city: workplace.city ?? "",
    region: workplace.region ?? "",
    street: workplace.street ?? "",
    zip: workplace.zip ?? "",
    blurb: workplace.blurb ?? "",
    rooms: (workplace.rooms ?? []).flatMap((room) =>
      room && isRoomKind(room.kind) ? [{ kind: room.kind, score: room.score }] : [],
    ),
    listedPlan: workplace.listedPlan ?? "free",
    demo: Boolean(workplace.demo),
  }
}

function asReport(value: unknown): Report | null {
  if (!value || typeof value !== "object") return null
  const report = value as Report
  if (!report.id || !report.workplaceId || !isRoomKind(report.roomKind)) return null
  return report
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<BoardPayload | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await getBoard()
      setLive(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The board couldn't be reached.")
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<BoardValue>(() => {
    const merged = mergeBoard({
      demoWorkplaces: getWorkplaces(),
      demoReports: getReports(),
      liveWorkplaces: live?.workplaces ?? [],
      liveReports: live?.reports ?? [],
    })
    const workplaces = merged.workplaces.flatMap((workplace) => {
      const normalized = asWorkplace(workplace)
      return normalized ? [normalized] : []
    })
    const byId = new Map(workplaces.map((workplace) => [workplace.id, workplace]))
    const reports = merged.reports.flatMap((report) => {
      const normalized = asReport(report)
      const workplace = normalized ? byId.get(normalized.workplaceId) : undefined
      if (!normalized || !workplace) return []
      return [{ ...normalized, workplace }]
    })
    reports.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    const publicRecords = [...(live?.publicRecords ?? [])].sort((a, b) =>
      b.recordDate.localeCompare(a.recordDate),
    )
    const ownerAwards = live?.ownerAwards ?? []

    return {
      ready,
      error,
      workplaces,
      reports,
      publicRecords,
      ownerAwards,
      refresh,
      workplaceBySlug: (slug) => workplaces.find((workplace) => workplace.slug === slug),
      reportsForWorkplace: (workplaceId) =>
        reports.filter((report) => report.workplaceId === workplaceId),
      recentReports: (limit = 8) => reports.slice(0, limit),
      disputedReports: () => reports.filter((report) => report.disputed),
      filterWorkplaces: (filters) =>
        filterAndSortWorkplaces(workplaces, publicRecords, filters) as Workplace[],
    }
  }, [live, ready, error, refresh])

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoard() {
  const value = useContext(BoardContext)
  if (!value) throw new Error("useBoard must be used inside BoardProvider")
  return value
}
