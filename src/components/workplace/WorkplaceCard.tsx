import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { overallScore } from "@/data/catalog"
import { INDUSTRY_LABELS, ROOM_LABELS, type Workplace } from "@/data/types"
import { formatScore, scoreClass } from "@/lib/format"

export function WorkplaceCard({ workplace }: { workplace: Workplace }) {
  const score = overallScore(workplace)
  return (
    <Link
      to={`/workplaces/${workplace.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card/80 p-4 transition-colors hover:border-primary/50 hover:bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xl tracking-tight group-hover:text-primary">
            {workplace.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {workplace.city}, {workplace.region}
          </p>
        </div>
        <p className={`font-mono text-3xl ${scoreClass(score)}`}>{formatScore(score)}</p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">
        {workplace.blurb}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{INDUSTRY_LABELS[workplace.industry]}</Badge>
        <Badge variant="outline">DEMO</Badge>
        {workplace.rooms.map((room) => (
          <Badge key={room.kind} variant="outline" className="font-normal">
            {ROOM_LABELS[room.kind]}
          </Badge>
        ))}
      </div>
    </Link>
  )
}
