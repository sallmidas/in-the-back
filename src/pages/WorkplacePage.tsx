import { Link, useParams, useSearchParams } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"
import { ReportCard } from "@/components/report/ReportCard"
import { RoomScore } from "@/components/room/RoomScore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getWorkplaceBySlug, overallScore, reportsForWorkplace } from "@/data/catalog"
import { INDUSTRY_LABELS, ROOM_LABELS, isRoomKind } from "@/data/types"
import { formatScore, scoreClass } from "@/lib/format"

export function WorkplacePage() {
  const { slug = "" } = useParams()
  const [params, setParams] = useSearchParams()
  const workplace = getWorkplaceBySlug(slug)
  const roomParam = params.get("room")
  const roomFilter =
    roomParam && isRoomKind(roomParam) && workplace?.rooms.some((room) => room.kind === roomParam)
      ? roomParam
      : null

  if (!workplace) {
    return (
      <EmptyState
        title="No board for this place."
        primaryTo="/workplaces"
        primaryLabel="Back to directory"
      >
        <p>Might be a bad link, or it isn't on In the Back yet.</p>
      </EmptyState>
    )
  }

  const reports = reportsForWorkplace(workplace.id).filter((report) =>
    roomFilter ? report.roomKind === roomFilter : true,
  )
  const score = overallScore(workplace)

  function toggleRoom(kind: string) {
    const next = new URLSearchParams(params)
    if (roomFilter === kind) next.delete("room")
    else next.set("room", kind)
    setParams(next, { replace: true })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">DEMO</Badge>
            <Badge variant="secondary">{INDUSTRY_LABELS[workplace.industry]}</Badge>
            <Badge variant="outline" className="capitalize">
              {workplace.listedPlan} · preview
            </Badge>
          </div>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">{workplace.name}</h1>
          <p className="text-muted-foreground">
            {workplace.city}, {workplace.region}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed sm:text-[15px] sm:leading-7">
            {workplace.blurb}
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-border bg-card px-5 py-4 sm:min-w-[9.5rem] sm:text-right">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Room average
          </p>
          <p className={`font-mono text-4xl sm:text-5xl ${scoreClass(score)}`}>
            {formatScore(score)}
            <span className="ml-1 text-xs tracking-widest text-muted-foreground uppercase">
              /10
            </span>
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-heading text-2xl tracking-tight">Rooms</h2>
          <p className="text-sm text-muted-foreground">Tap a room to filter excerpts.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {workplace.rooms.map((room) => (
            <RoomScore
              key={room.kind}
              room={room}
              selected={roomFilter === room.kind}
              onSelect={() => toggleRoom(room.kind)}
            />
          ))}
        </div>
        {roomFilter ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setParams({})}>
            Show all rooms
          </Button>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">
            {roomFilter ? `${ROOM_LABELS[roomFilter]} excerpts` : "Anonymous excerpts"}
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/staff">Staff chair? This is my queue</Link>
          </Button>
        </div>
        {reports.length === 0 ? (
          <EmptyState
            eyebrow="This room"
            title="This room's unscored."
            primaryTo="/write"
            primaryLabel="Score this room"
          >
            <p>First mark sets the tone. Keep it fair, keep it specific.</p>
          </EmptyState>
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
