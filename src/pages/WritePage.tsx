import { Link } from "react-router-dom"
import { HoldNotice } from "@/components/layout/HoldNotice"
import { Button } from "@/components/ui/button"
import { isDemoSeedEnabled } from "@/data/demo-flag"

export function WritePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Filing held
        </p>
        <h1 className="font-heading text-4xl tracking-tight">No live reports yet</h1>
        <p className="text-muted-foreground">
          After the LLC, a filing will be anonymous (room, score, shift context, writing — never
          a name). Watch is the kitchen seeing files land; Respond is the kitchen flagging a
          report. Until then this form stays closed so a demo cannot be mistaken for a live board.
        </p>
        <HoldNotice />
      </header>
      <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        <p className="font-mono text-[11px] tracking-[0.16em] text-foreground uppercase">
          What a report will look like
        </p>
        <p className="mt-3">
          Workplace → room → score /10 → shift context (no identity) → excerpt. Disputes become{" "}
          <span className="text-destructive">DISPUTED — UNDER REVIEW</span>, not a public argument
          with a person.
        </p>
      </div>
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
