import { Link } from "react-router-dom"
import { DisputeBadge } from "@/components/report/DisputeBadge"
import { Badge } from "@/components/ui/badge"
import type { Report, Workplace } from "@/data/types"
import { ROOM_LABELS } from "@/data/types"
import { formatPublishedAt, formatScore, scoreClass } from "@/lib/format"

type Props = {
  report: Report
  workplace: Workplace
  showWorkplace?: boolean
}

export function ReportCard({ report, workplace, showWorkplace = true }: Props) {
  return (
    <article className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {showWorkplace ? (
            <Link
              to={`/workplaces/${workplace.slug}`}
              className="font-heading text-lg tracking-tight text-foreground hover:text-primary"
            >
              {workplace.name}
            </Link>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{ROOM_LABELS[report.roomKind]}</Badge>
            <span>{report.context}</span>
            <span aria-hidden>·</span>
            <time dateTime={report.publishedAt}>{formatPublishedAt(report.publishedAt)}</time>
          </div>
        </div>
        <p className={`font-mono text-3xl leading-none ${scoreClass(report.score)}`}>
          {formatScore(report.score)}
          <span className="ml-1 text-xs tracking-widest text-muted-foreground uppercase">/10</span>
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{report.excerpt}</p>
      {report.disputed ? <DisputeBadge className="mt-3" /> : null}
    </article>
  )
}
