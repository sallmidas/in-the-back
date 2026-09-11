import { ROOM_LABELS, type Room } from "@/data/types"
import { formatScore, scoreClass } from "@/lib/format"

export function RoomScore({ room }: { room: Room }) {
  return (
    <div className="flex min-w-[7.5rem] flex-col gap-1 rounded-lg border border-border bg-background/60 px-3 py-2">
      <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {ROOM_LABELS[room.kind]}
      </span>
      <span className={`font-mono text-2xl leading-none ${scoreClass(room.score)}`}>
        {formatScore(room.score)}
      </span>
    </div>
  )
}
