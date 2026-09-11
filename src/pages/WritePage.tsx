import { Link } from "react-router-dom"
import { HoldNotice } from "@/components/layout/HoldNotice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isDemoSeedEnabled } from "@/data/demo-flag"

const heldFieldClass =
  "disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-muted/40"

export function WritePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Filing held
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Closed until the LLC</h1>
        <p className="text-muted-foreground">
          The form is the real shape: workplace, room, score, shift context, writing — never a
          name. It will not send. Watch is the kitchen seeing files land; Respond is the kitchen
          flagging a report. Publish stays off so a demo cannot be mistaken for a live board.
        </p>
        <HoldNotice />
      </header>

      <form
        aria-disabled="true"
        onSubmit={(event) => event.preventDefault()}
        className="space-y-4 rounded-xl border border-primary/35 bg-card/70 p-5"
      >
        <fieldset disabled className="space-y-4 disabled:opacity-100">
          <legend className="font-mono px-1 text-[11px] tracking-[0.16em] text-primary uppercase">
            Held on purpose — will not send
          </legend>

          <div className="space-y-1.5">
            <Label htmlFor="write-workplace">Workplace</Label>
            <Input
              id="write-workplace"
              className={heldFieldClass}
              placeholder="Choose a workplace"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="write-room">Room</Label>
            <Input
              id="write-room"
              className={heldFieldClass}
              placeholder="Walk-in, dish pit, dock…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="write-score">Score /10</Label>
            <Input
              id="write-score"
              className={heldFieldClass}
              inputMode="decimal"
              placeholder="Cleanliness, safety, dignity"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="write-context">Shift context</Label>
            <Input
              id="write-context"
              className={heldFieldClass}
              placeholder="Tuesday close · prep — no identity"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="write-excerpt">Writing</Label>
            <Textarea
              id="write-excerpt"
              className={heldFieldClass}
              placeholder="What you saw in the room. Never a name."
              rows={4}
            />
          </div>

          <Button
            type="button"
            disabled
            className="h-11 w-full disabled:pointer-events-none disabled:opacity-100 disabled:bg-primary/15 disabled:text-primary"
          >
            Held until LLC
          </Button>
        </fieldset>
      </form>

      <p className="text-sm text-muted-foreground">
        After the LLC this same form publishes anonymously. No pay on send. No Stripe from this
        page.
      </p>

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
