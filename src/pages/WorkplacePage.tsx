import { Link, useParams } from "react-router-dom"
import { ReportCard } from "@/components/report/ReportCard"
import { RoomScore } from "@/components/room/RoomScore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getWorkplaceBySlug, overallScore, reportsForWorkplace } from "@/data/catalog"
import { INDUSTRY_LABELS } from "@/data/types"
import { formatScore, scoreClass } from "@/lib/format"

export function WorkplacePage() {
  const { slug = "" } = useParams()
  const workplace = getWorkplaceBySlug(slug)

  if (!workplace) {
    return (
      <div className="space-y-3">
        <h1 className="font-heading text-3xl">Workplace not on the board</h1>
        <p className="text-muted-foreground">
          That slug isn&apos;t in the current catalog. If you stripped the demo seed, the
          directory is supposed to be empty.
        </p>
        <Button asChild variant="outline">
          <Link to="/workplaces">Back to directory</Link>
        </Button>
      </div>
    )
  }

  const reports = reportsForWorkplace(workplace.id)
  const score = overallScore(workplace)

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">DEMO</Badge>
            <Badge variant="secondary">{INDUSTRY_LABELS[workplace.industry]}</Badge>
            <Badge variant="outline" className="capitalize">
              {workplace.listedPlan} plan
            </Badge>
          </div>
          <h1 className="font-heading text-4xl tracking-tight">{workplace.name}</h1>
          <p className="text-muted-foreground">
            {workplace.city}, {workplace.region}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed">{workplace.blurb}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-right">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Room average
          </p>
          <p className={`font-mono text-5xl ${scoreClass(score)}`}>{formatScore(score)}</p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl tracking-tight">Rooms</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {workplace.rooms.map((room) => (
            <RoomScore key={room.kind} room={room} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">Anonymous excerpts</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/staff">Staff chair? This is my queue</Link>
          </Button>
        </div>
        {reports.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No published reports for these rooms yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                workplace={workplace}
                showWorkplace={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
