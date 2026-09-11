import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { overallScore, weakestRoom } from "@/data/catalog"
import { INDUSTRY_LABELS, ROOM_LABELS, type Workplace } from "@/data/types"
import { formatScore, scoreClass, scoreRailClass } from "@/lib/format"
import { cn } from "@/lib/utils"

export function WorkplaceCard({ workplace }: { workplace: Workplace }) {
  const score = overallScore(workplace)
  const weak = weakestRoom(workplace)

  return (
    <Link
      to={`/workplaces/${workplace.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border border-l-4 bg-card/80 p-4 transition-colors hover:border-primary/50 hover:bg-card sm:p-5",
        scoreRailClass(score),
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-xl tracking-tight group-hover:text-primary">
            {workplace.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {workplace.city}, {workplace.region}
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            {INDUSTRY_LABELS[workplace.industry]}
          </p>
        </div>
        <p className={`font-mono shrink-0 text-3xl leading-none ${scoreClass(score)}`}>
          {formatScore(score)}
          <span className="ml-1 text-[10px] tracking-widest text-muted-foreground uppercase">
            /10
          </span>
        </p>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/85">
        {workplace.blurb}
      </p>
      {weak ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Lowest room:{" "}
          <span className={scoreClass(weak.score)}>
            {ROOM_LABELS[weak.kind]} {formatScore(weak.score)}
          </span>
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {workplace.rooms.map((room) => (
          <span
            key={room.kind}
            className="flex items-center justify-between gap-2 rounded-md bg-muted/55 px-2 py-1.5"
          >
            <span className="truncate text-[11px] text-muted-foreground">
              {ROOM_LABELS[room.kind]}
            </span>
            <span className={`font-mono text-xs ${scoreClass(room.score)}`}>
              {formatScore(room.score)}
            </span>
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="outline">DEMO</Badge>
        <Badge variant="secondary" className="capitalize">
          {workplace.listedPlan} · preview
        </Badge>
      </div>
    </Link>
  )
}

export function WorkplaceStripCard({ workplace }: { workplace: Workplace }) {
  const score = overallScore(workplace)
  const weak = weakestRoom(workplace)

  return (
    <Link
      to={`/workplaces/${workplace.slug}`}
      className={cn(
        "flex min-w-[15.5rem] snap-start flex-col rounded-xl border border-border border-l-4 bg-card/80 px-3 py-3 hover:border-primary/50 md:min-w-0",
        scoreRailClass(score),
      )}
    >
      <span className="font-heading truncate text-sm">{workplace.name}</span>
      <span className={`font-mono mt-1 text-2xl leading-none ${scoreClass(score)}`}>
        {formatScore(score)}
        <span className="ml-1 text-[10px] tracking-widest text-muted-foreground uppercase">
          /10
        </span>
      </span>
      <span className="mt-1 text-[11px] text-muted-foreground">
        {workplace.city}, {workplace.region}
      </span>
      {weak ? (
        <span className="mt-2 text-[11px] text-muted-foreground">
          Lowest:{" "}
          <span className={scoreClass(weak.score)}>
            {ROOM_LABELS[weak.kind]} {formatScore(weak.score)}
          </span>
        </span>
      ) : null}
    </Link>
  )
}
