import { Link } from "react-router-dom"
import { HowItWorksSteps, SampleRoomStrip } from "@/components/layout/HowItWorks"
import { HoldNotice } from "@/components/layout/HoldNotice"
import { DisputeBadge } from "@/components/report/DisputeBadge"
import { Button } from "@/components/ui/button"
import { isDemoSeedEnabled } from "@/data/demo-flag"

export function HowItWorksPage() {
  const seeded = isDemoSeedEnabled()

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          How it works
        </p>
        <h1 className="font-heading max-w-2xl text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Cleanliness, safety, dignity — scored
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          In the Back is a room-level board for the parts of a building the dining room never
          sees. You read a kitchen, a pit, a walk-in, a dock. You never read a person. This is
          not a job board and not a place to rank a CEO.
        </p>
        <HoldNotice />
        <div className="flex flex-wrap gap-2">
          {seeded ? (
            <Button asChild>
              <Link to="/workplaces/harbor-and-rye?room=walk-in">Open a sample room</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/workplaces">See the empty directory</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/plans">Plans (preview only)</Link>
          </Button>
        </div>
      </header>

      <HowItWorksSteps />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-heading text-2xl tracking-tight">What a room looks like</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Each workplace is a set of rooms with a score out of ten. Tap a room on a listing to
            filter the anonymous excerpts. The number is about the space and the shift — not who
            wrote it.
          </p>
          <SampleRoomStrip />
        </div>
        <div className="space-y-3">
          <h2 className="font-heading text-2xl tracking-tight">What a report looks like</h2>
          <article className="rounded-xl border border-border border-l-4 border-l-destructive bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2 py-0.5 text-foreground">
                Walk-in
              </span>
              <span>Tuesday close · prep</span>
            </div>
            <p className="mt-3 text-[15px] leading-7 sm:text-base">
              Walk-in was 48° at 2am. Dairy sitting in a sheet pan on the floor. Nobody logged a
              temp all close.
            </p>
            <DisputeBadge className="mt-3" />
            <p className="mt-3 text-xs text-muted-foreground">
              Illustration of layout and the dispute badge. No reviewer name, ever.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 rounded-xl border border-border bg-card/60 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h2 className="font-heading text-xl tracking-tight">What the public sees</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Workplace, city, industry, rooms.</li>
            <li>Room scores and anonymous excerpts.</li>
            <li>Shift or station context written without a name.</li>
            <li>
              A dispute badge when a chair has flagged a report — exactly{" "}
              <span className="text-destructive">DISPUTED — UNDER REVIEW</span>.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-xl tracking-tight">What stays off</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Reviewer name, handle, email, badge, or login.</li>
            <li>Staff chair identity, even after they claim a queue.</li>
            <li>Hiring copy, résumés, or “rate my boss.”</li>
            <li>Live filing and Stripe — held until the LLC exists. No card on file.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
