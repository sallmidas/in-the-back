import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getWorkplaces } from "@/data/catalog"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import { ROOM_KINDS, ROOM_LABELS, isRoomKind } from "@/data/types"

const UNSET = "unset"

export function WritePage() {
  const workplaces = getWorkplaces()
  const [workplaceSlug, setWorkplaceSlug] = useState(UNSET)
  const [workplaceName, setWorkplaceName] = useState("")
  const [room, setRoom] = useState(UNSET)
  const [score, setScore] = useState("")
  const [context, setContext] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const workplace =
      workplaces.length > 0
        ? workplaces.find((item) => item.slug === workplaceSlug)?.name
        : workplaceName.trim()
    const scoreValue = Number.parseFloat(score)

    if (!workplace) {
      setNotice(null)
      setError("Name the workplace. Filing is open — this form will send.")
      return
    }
    if (!isRoomKind(room)) {
      setNotice(null)
      setError("Pick a room.")
      return
    }
    if (!Number.isFinite(scoreValue) || scoreValue < 1 || scoreValue > 10) {
      setNotice(null)
      setError("Score cleanliness, safety, and dignity from 1 to 10.")
      return
    }
    if (!context.trim() || !excerpt.trim()) {
      setNotice(null)
      setError("Shift context and writing are required. Never a name.")
      return
    }

    setError(null)
    setWorkplaceSlug(UNSET)
    setWorkplaceName("")
    setRoom(UNSET)
    setScore("")
    setContext("")
    setExcerpt("")
    setNotice(
      "Filed. Anonymous — room, score, shift context, writing. Never a name. No pay on send. Watch is the kitchen seeing files land; Respond is the kitchen flagging. Payouts and Watch billing stay on Plans until the LLC.",
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          File a report
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Score a room</h1>
        <p className="text-muted-foreground">
          Filing is open. Workplace, room, score, shift context, writing — never a name. No pay
          on send. Watch is the kitchen seeing files land; Respond is the kitchen flagging a
          report. Payouts and Watch billing stay on Plans until the LLC.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border bg-card/70 p-5"
      >
        {workplaces.length > 0 ? (
          <div className="space-y-1.5">
            <Label htmlFor="write-workplace">Workplace</Label>
            <Select value={workplaceSlug} onValueChange={setWorkplaceSlug}>
              <SelectTrigger id="write-workplace" className="w-full">
                <SelectValue placeholder="Choose a workplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Choose a workplace</SelectItem>
                {workplaces.map((workplace) => (
                  <SelectItem key={workplace.slug} value={workplace.slug}>
                    {workplace.name}
                    {workplace.demo ? " · DEMO" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="write-workplace">Workplace</Label>
            <Input
              id="write-workplace"
              value={workplaceName}
              onChange={(event) => setWorkplaceName(event.target.value)}
              placeholder="The kitchen, dock, or ward"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="write-room">Room</Label>
          <Select value={room} onValueChange={setRoom}>
            <SelectTrigger id="write-room" className="w-full">
              <SelectValue placeholder="Walk-in, dish pit, dock…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>Choose a room</SelectItem>
              {ROOM_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {ROOM_LABELS[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-score">Score /10</Label>
          <Input
            id="write-score"
            inputMode="decimal"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="Cleanliness, safety, dignity"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-context">Shift context</Label>
          <Input
            id="write-context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Tuesday close · prep — no identity"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-excerpt">Writing</Label>
          <Textarea
            id="write-excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="What you saw in the room. Never a name."
            rows={4}
          />
        </div>

        <Button type="submit" className="h-11 w-full">
          File report
        </Button>
        <p className="text-xs text-muted-foreground">
          Stub send — no Stripe, no card, no reviewer identity. A flag later is uphold or retract,
          never delete.
        </p>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {isDemoSeedEnabled() ? (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/workplaces/harbor-and-rye?room=walk-in">See a seeded report</Link>
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/how-it-works">How a report will read</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/">Back to the board</Link>
        </Button>
      </div>
    </div>
  )
}
