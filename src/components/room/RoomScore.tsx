import { ROOM_LABELS, type Room } from "@/data/types"
import { formatScore, scoreClass } from "@/lib/format"
import { cn, focusRingClass } from "@/lib/utils"

type Props = {
  room: Room
  selected?: boolean
  onSelect?: () => void
}

export function RoomScore({ room, selected = false, onSelect }: Props) {
  const className = cn(
    "flex min-h-11 w-full min-w-0 flex-col justify-center gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
    selected
      ? "border-primary bg-primary/10"
      : "border-border bg-background/60 hover:border-primary/40",
    onSelect && focusRingClass,
  )

  const body = (
    <>
      <span className="text-xs leading-tight text-muted-foreground">
        {ROOM_LABELS[room.kind]}
      </span>
      <span className={`font-mono text-2xl leading-none tabular-nums ${scoreClass(room.score)}`}>
        {formatScore(room.score)}
      </span>
    </>
  )

  if (!onSelect) {
    return <div className={className}>{body}</div>
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${ROOM_LABELS[room.kind]}, ${formatScore(room.score)} out of 10`}
    >
      {body}
    </button>
  )
}
