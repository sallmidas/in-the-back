import { Link } from "react-router-dom"
import { ReportCard } from "@/components/report/ReportCard"
import { Button } from "@/components/ui/button"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import { recentReports } from "@/data/catalog"

export function HomePage() {
  const reports = recentReports()
  const empty = !isDemoSeedEnabled() || reports.length === 0

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
            Room-level BOH board
          </p>
          <h1 className="font-heading max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            The rooms they don&apos;t put on the hiring flyer.
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Kitchens, dish pits, walk-ins, staff bathrooms, break rooms, docks, stock, overnight.
            Public sees the room, the score, the shift context, and the writing. Never the
            reviewer. This is not Glassdoor.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/workplaces">Browse workplaces</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/plans">Watch / Respond plans</Link>
            </Button>
          </div>
        </div>
        <aside className="rounded-xl border border-border bg-card/70 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-mono text-[11px] tracking-[0.16em] text-foreground uppercase">
            What stays off the board
          </p>
          <ul className="mt-3 space-y-2">
            <li>No names, handles, or badge numbers.</li>
            <li>No star-rating of a CEO. Rooms only.</li>
            <li>Disputes become a public badge, not a pile-on.</li>
            <li>Staff chair can claim a queue. The public still never sees who.</li>
          </ul>
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">Recent reports</h2>
          <Link to="/workplaces" className="text-sm text-muted-foreground hover:text-foreground">
            Full directory
          </Link>
        </div>
        {empty ? (
          <EmptyBoard />
        ) : (
          <div className="grid gap-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                workplace={report.workplace}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyBoard() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="font-heading text-xl">The board is empty</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Demo seed is off, or there are no published reports yet. Restore{" "}
        <code className="font-mono text-xs">VITE_DEMO_SEED=1</code> or wait for the first
        anonymous filing to publish.
      </p>
    </div>
  )
}
