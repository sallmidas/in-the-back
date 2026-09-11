import { useEffect } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"
import { HowItWorksPreview } from "@/components/layout/HowItWorks"
import { DemoWalk, HoldNotice } from "@/components/layout/HoldNotice"
import { ReportCard } from "@/components/report/ReportCard"
import { Button } from "@/components/ui/button"
import { WorkplaceStripCard } from "@/components/workplace/WorkplaceCard"
import { disputedReports, getWorkplaces, recentReports } from "@/data/catalog"
import { isDemoSeedEnabled } from "@/data/demo-flag"

export function HomePage() {
  const reports = recentReports(8)
  const featured = disputedReports()[0]
  const workplaces = getWorkplaces()
  const seeded = isDemoSeedEnabled()
  const empty = !seeded || reports.length === 0

  useEffect(() => {
    const id = window.location.hash.replace("#", "")
    if (id !== "demo-walk" && id !== "how-it-works") return
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <div className="space-y-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
            Room-level BOH board
          </p>
          <h1 className="font-heading max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Cleanliness, safety, dignity — scored
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Kitchens, dish pits, walk-ins, staff bathrooms, break rooms, docks, stock, overnight.
            Public sees the room, the score, the shift context, and the writing. Never the
            reviewer. This is not Glassdoor.
          </p>
          <HoldNotice />
          <div className="flex flex-wrap gap-2">
            {seeded ? (
              <>
                <Button asChild>
                  <Link to="/workplaces/harbor-and-rye?room=walk-in">Open the demo room</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/workplaces">All 10 workplaces</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/how-it-works">How it works</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/workplaces">Empty directory</Link>
                </Button>
              </>
            )}
            {seeded ? (
              <Button asChild variant="ghost">
                <Link to="/how-it-works">How it works</Link>
              </Button>
            ) : null}
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

      <HowItWorksPreview />

      {seeded ? <DemoWalk /> : null}

      {featured ? (
        <section className="space-y-3">
          <h2 className="font-heading text-2xl tracking-tight">Pinned dispute</h2>
          <ReportCard report={featured} workplace={featured.workplace} />
        </section>
      ) : null}

      {workplaces.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-heading text-2xl tracking-tight">DEMO workplaces</h2>
            <Link to="/workplaces" className="text-sm text-muted-foreground hover:text-foreground">
              Directory
            </Link>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-5">
            {workplaces.map((workplace) => (
              <WorkplaceStripCard key={workplace.id} workplace={workplace} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">Recent reports</h2>
          <Link to="/workplaces" className="text-sm text-muted-foreground hover:text-foreground">
            Full directory
          </Link>
        </div>
        {empty ? (
          <EmptyState
            eyebrow={seeded ? "No reports yet" : "Quiet board"}
            title="Board is quiet."
          >
            <p>
              No rooms scored here yet. Be the first honest mark — cleanliness, safety, dignity.
            </p>
          </EmptyState>
        ) : (
          <div className="grid gap-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} workplace={report.workplace} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
