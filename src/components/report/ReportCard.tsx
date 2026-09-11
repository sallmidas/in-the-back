import { Link } from "react-router-dom"
import { DisputeBadge } from "@/components/report/DisputeBadge"
import { Badge } from "@/components/ui/badge"
import type { Report, Workplace } from "@/data/types"
import { ROOM_LABELS } from "@/data/types"
import { formatPublishedAt, formatScore, scoreClass, scoreRailClass } from "@/lib/format"
import { cn, focusRingClass } from "@/lib/utils"

type Props = {
  report: Report
  workplace: Workplace
  showWorkplace?: boolean
}

export function ReportCard({ report, workplace, showWorkplace = true }: Props) {
  const roomHref = `/workplaces/${workplace.slug}?room=${report.roomKind}`

  return (
    <article
      className={cn(
        "rounded-xl border border-border/80 border-l-4 bg-card/90 p-4 shadow-sm sm:p-5",
        scoreRailClass(report.score),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {showWorkplace ? (
            <Link
              to={`/workplaces/${workplace.slug}`}
              className={cn(
                "font-heading rounded-sm text-lg tracking-tight text-foreground hover:text-primary",
                focusRingClass,
              )}
            >
              {workplace.name}
            </Link>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {ROOM_LABELS[report.roomKind]}
            </Badge>
            <span>{report.context}</span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <time dateTime={report.publishedAt}>{formatPublishedAt(report.publishedAt)}</time>
          </div>
        </div>
        <p
          className={`font-mono flex items-baseline gap-1 text-3xl leading-none sm:flex-col sm:items-end ${scoreClass(report.score)}`}
        >
          <span>{formatScore(report.score)}</span>
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">/10</span>
        </p>
      </div>
      <p className="mt-3 text-[15px] leading-7 text-foreground/95 sm:text-base sm:leading-7">
        {report.excerpt}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {report.disputed ? <DisputeBadge /> : <span />}
        <Link
          to={roomHref}
          className={cn(
            "rounded-sm text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
            focusRingClass,
          )}
        >
          Open {ROOM_LABELS[report.roomKind]}
        </Link>
      </div>
    </article>
  )
}
