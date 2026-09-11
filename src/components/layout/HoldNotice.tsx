import { Link } from "react-router-dom"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import { cn, focusRingClass } from "@/lib/utils"

export function HoldNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary ${className}`}
    >
      Filing and billing are held until the LLC exists. No Stripe. No card on file. Live
      publish stays off.
      {isDemoSeedEnabled()
        ? " The seeded board is the demo — not live reviews."
        : " Demo seed is off, so the catalog is the empty launch state."}
    </p>
  )
}

export function DemoWalk() {
  const steps = [
    {
      n: "01",
      to: "/workplaces/harbor-and-rye?room=walk-in",
      title: "A disputed room",
      body: "Harbor & Rye walk-in — score, writing, DISPUTED badge. No reviewer name.",
    },
    {
      n: "02",
      to: "/workplaces",
      title: "Ten DEMO workplaces",
      body: "Search and filter kitchens, docks, overnight, hospitals, grocers.",
    },
    {
      n: "03",
      to: "/staff",
      title: "Platform chair stub",
      body: "In the Back's chair — not Watch or Respond. Sign in locally, claim “This is my queue.” Public still never sees you.",
    },
    {
      n: "04",
      to: "/plans",
      title: "Browse plans",
      body: "Free / Watch / Respond — kitchen tools, preview only. Not the platform chair.",
    },
  ]

  return (
    <section id="demo-walk" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-heading text-2xl tracking-tight">Walk the demo</h2>
        <p className="text-sm text-muted-foreground">Four clicks. Same app as the installable shell.</p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.n}>
            <Link
              to={step.to}
              className={cn(
                "flex h-full flex-col rounded-xl border border-border bg-card/80 p-4 transition-colors hover:border-primary/50",
                focusRingClass,
              )}
            >
              <span className="font-mono text-[11px] tracking-[0.18em] text-primary">
                {step.n}
              </span>
              <span className="font-heading mt-2 text-lg tracking-tight">{step.title}</span>
              <span className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
