import { Link } from "react-router-dom"
import { PREVIEW_NOTE } from "../../../shared/plan-copy.mjs"
import { demoSeedEnabled } from "@/data/demo-flag"
import { useDemoRoomPath } from "@/lib/demo-room"
import { cn, focusRingClass } from "@/lib/utils"

export function HoldNotice({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      {PREVIEW_NOTE}
      {demoSeedEnabled ? " The sample workplaces are labeled DEMO." : ""}
    </p>
  )
}

export function DemoWalk() {
  const demoPath = useDemoRoomPath() ?? "/workplaces"
  const steps = [
    {
      n: "01",
      to: demoPath,
      title: "A disputed room",
      body: "A labeled DEMO room — score, writing, DISPUTED badge. No reviewer name.",
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
      title: "Platform chair",
      body: "Sign in and claim the one platform queue. It is not a workplace. The public never sees who.",
    },
    {
      n: "04",
      to: "/stores",
      title: "For stores",
      body: "Store plans are labeled as planned. Nothing is charged during the preview.",
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
