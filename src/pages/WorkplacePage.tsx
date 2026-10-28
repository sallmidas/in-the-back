import { useParams, useSearchParams } from "react-router-dom"
import { BoardSkeleton } from "@/components/layout/BoardSkeleton"
import { EmptyState } from "@/components/layout/EmptyState"
import { PublicRecordCard, PublicRecordFootnote } from "@/components/record/PublicRecordCard"
import { CITATION_NOTE, GRAVITY_LEGEND, splitRecords } from "@/lib/records"
import { ReportCard } from "@/components/report/ReportCard"
import { RoomScore } from "@/components/room/RoomScore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { overallScore } from "@/data/catalog"
import { INDUSTRY_LABELS, ROOM_LABELS, isRoomKind } from "@/data/types"
import { useBoard } from "@/lib/board"
import { formatScore, scoreClass } from "@/lib/format"

export function WorkplacePage() {
  const { slug = "" } = useParams()
  const [params, setParams] = useSearchParams()
  const board = useBoard()
  const workplace = board.workplaceBySlug(slug)

  if (!board.ready) return <BoardSkeleton variant="workplace" />
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
        titleAs="h1"
      >
        <p>Might be a bad link, or it isn't on In the Back yet.</p>
      </EmptyState>
    )
  }

  const reports = board.reportsForWorkplace(workplace.id).filter((report) =>
    roomFilter ? report.roomKind === roomFilter : true,
  )
  const publicRecords = board.publicRecords.filter(
    (record) => record.workplaceId === workplace.id || record.workplaceSlug === workplace.slug,
  )
  const { good, findings } = splitRecords(publicRecords)
  const shoutOuts = reports.filter((report) => report.kind === "shout-out")
  const roomReports = reports.filter((report) => report.kind !== "shout-out")
  const awards = board.ownerAwards.filter(
    (award) => award.workplaceId === workplace.id || award.workplaceSlug === workplace.slug,
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
            {workplace.demo ? <Badge variant="outline">DEMO</Badge> : null}
            {workplace.industryLabel || workplace.industry ? (
              <Badge variant="secondary">
                {workplace.industryLabel ||
                  (workplace.industry ? INDUSTRY_LABELS[workplace.industry] : "")}
              </Badge>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">{workplace.name}</h1>
          <p className="text-muted-foreground">
            {[workplace.street, workplace.city, workplace.region, workplace.zip].filter(Boolean).join(", ")}
          </p>
          {workplace.blurb ? (
            <p className="max-w-2xl text-sm leading-relaxed sm:text-[15px] sm:leading-7">
              {workplace.blurb}
            </p>
          ) : null}
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
          <p className="mt-1 text-xs text-muted-foreground">10 is a solid room.</p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-heading text-2xl tracking-tight">Rooms</h2>
          <p className="text-sm text-muted-foreground">Tap a room to filter excerpts.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setParams({})}
          >
            Show all rooms
          </Button>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">
            {roomFilter ? `${ROOM_LABELS[roomFilter]} excerpts` : "Anonymous excerpts"}
          </h2>
        </div>
        {roomReports.length === 0 ? (
          <EmptyState
            eyebrow="This room"
            title="This room's unscored."
            primaryTo={`/write?workplace=${workplace.slug}${roomFilter ? `&room=${roomFilter}` : ""}`}
            primaryLabel="File a report"
          >
            <p>No report on this room yet. File one, and keep it about the room.</p>
          </EmptyState>
        ) : (
          <div className="grid gap-3">
            {roomReports.map((report) => (
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

      <section className="space-y-3">
        <h2 className="font-heading text-2xl tracking-tight">Good news</h2>
        <p className="text-sm text-muted-foreground">
          An inspection or case with no finding, a government award, or a shout-out. This is not a rating of the whole business.
        </p>
        {good.length === 0 && shoutOuts.length === 0 && awards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No good-news records yet.</p>
        ) : (
          <div className="grid gap-3">
            {awards.map((award) => (
              <article key={award.id} className="space-y-2 rounded-xl border border-l-4 border-l-emerald-400 border-border bg-card/80 p-4">
                <p className="text-sm font-medium">{award.title}, {award.year}</p>
                <p className="text-xs text-muted-foreground">{award.label}</p>
              </article>
            ))}
            {good.map((record) => (
              <PublicRecordCard key={record.id} record={record} />
            ))}
            {shoutOuts.map((report) => (
              <ReportCard key={report.id} report={report} workplace={workplace} showWorkplace={false} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl tracking-tight">Public records</h2>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public records found.</p>
        ) : (
          <div className="grid gap-3">
            {findings.map((record) => (
              <PublicRecordCard key={record.id} record={record} />
            ))}
            <PublicRecordFootnote />
          </div>
        )}
        <p className="text-xs text-muted-foreground">{CITATION_NOTE}</p>
        <p className="text-xs text-muted-foreground">{GRAVITY_LEGEND}</p>
      </section>
    </div>
  )
}
