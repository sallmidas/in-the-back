import { demoSeedEnabled } from "@/data/demo-flag"
import { useBoard } from "@/lib/board"

/** Path to a labeled sample room, or null when the demo seed is off. */
export function useDemoRoomPath(): string | null {
  const board = useBoard()
  if (!demoSeedEnabled) return null
  const report =
    board.disputedReports().find((item) => item.workplace.demo) ??
    board.reports.find((item) => item.workplace.demo)
  if (!report) return "/workplaces"
  return `/workplaces/${report.workplace.slug}?room=${report.roomKind}`
}
