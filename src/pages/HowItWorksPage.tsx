import { Link } from "react-router-dom"
import { HowItWorksSteps, SampleRoomStrip } from "@/components/layout/HowItWorks"
import { Button } from "@/components/ui/button"
import { useDemoRoomPath } from "@/lib/demo-room"

export function HowItWorksPage() {
  const demoPath = useDemoRoomPath()

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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {demoPath ? (
            <Button asChild className="w-full sm:w-auto">
              <Link to={demoPath}>Open a sample room</Link>
            </Button>
          ) : (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/workplaces">Open directory</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/write">File a report</Link>
          </Button>
        </div>
      </header>

      <HowItWorksSteps />

      <section className="max-w-2xl space-y-4">
        <h2 className="font-heading text-2xl tracking-tight">Plain words</h2>
        <div className="space-y-2">
          <h3 className="font-heading text-xl tracking-tight">Back of house</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Back of house means the rooms guests do not sit in: the kitchen, the dish pit, the
            walk-in, the dock, stock, overnight. People sometimes shorten that to BOH. This board
            scores those rooms. It does not score a person.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl tracking-tight">A moderator</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A moderator reviews reports. They can hide a published filing, and put it back, under
            the{" "}
            <Link to="/content" className="underline-offset-4 hover:underline">
              content policy
            </Link>.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl tracking-tight">Public records</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Some pages also show official records: a Massachusetts citation, a federal safety
            inspection, or a wage case. Each one is labeled Public record. It is not a worker
            report. A person's name in an agency file is left off the page. The line under the
            record names the agency. That is a credit. It is not an endorsement. An inspection
            with no citations, or a wage case with no violations, is listed as good news. A
            shout-out is a filing that praises a room. It follows the same rules as any other filing.
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Reading and filing are free. The writing is about the room, never a person.
        </p>
      </section>

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
            <p className="mt-3 text-xs text-muted-foreground">
              Illustration of the layout. No name on the writing, ever.
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
            <li>Nothing that names who wrote it.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-xl tracking-tight">What stays off</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Reviewer name, handle, email, badge, or login.</li>
            <li>Hiring copy, résumés, or “rate my boss.”</li>
            <li>A charge. Reading and filing are free.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
