import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { isDemoSeedEnabled } from "@/data/demo-flag"

export function SeedRestoreHint() {
  return (
    <aside className="rounded-lg border border-border bg-muted/30 p-4 text-left text-sm">
      <p className="font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
        Strip / restore the demo seed
      </p>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        This empty catalog is the launch path:{" "}
        <code className="font-mono text-xs text-foreground">VITE_DEMO_SEED=0</code> in{" "}
        <code className="font-mono text-xs text-foreground">.env.local</code>. Sample workplaces
        stay in git; they just do not render.
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-muted-foreground">
        <li>
          Copy <code className="font-mono text-xs text-foreground">.env.example</code> to{" "}
          <code className="font-mono text-xs text-foreground">.env.local</code>
        </li>
        <li>
          Set <code className="font-mono text-xs text-foreground">VITE_DEMO_SEED=1</code> (or
          unset it — default is on)
        </li>
        <li>
          Restart <code className="font-mono text-xs text-foreground">npm run dev</code>
        </li>
      </ol>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Hard path: set <code className="font-mono">DEMO_WORKPLACES</code> and{" "}
        <code className="font-mono">DEMO_REPORTS</code> to <code className="font-mono">[]</code>{" "}
        in <code className="font-mono">src/data/seed.ts</code>. Switch lives in{" "}
        <code className="font-mono">src/data/demo-flag.ts</code>. README → “Strip the demo seed”.
      </p>
    </aside>
  )
}

type EmptyStateProps = {
  eyebrow?: string
  title: string
  children: ReactNode
  restore?: boolean
  cta?: boolean
}

export function EmptyState({
  eyebrow = "Empty catalog",
  title,
  children,
  restore,
  cta = true,
}: EmptyStateProps) {
  const showRestore = restore ?? !isDemoSeedEnabled()

  return (
    <div className="space-y-5 rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 sm:px-8">
      <div className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <p className="font-heading text-2xl tracking-tight sm:text-3xl">{title}</p>
        <div className="max-w-xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
      {showRestore ? <SeedRestoreHint /> : null}
      {cta ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/how-it-works">How it works</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/plans">Plans (no checkout)</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
