import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  eyebrow?: string
  title: string
  children: ReactNode
  cta?: boolean
  primaryTo?: string
  primaryLabel?: string
}

/** User-facing empty board. Dev seed restore steps live in the README only. */
export function EmptyState({
  eyebrow = "Quiet board",
  title,
  children,
  cta = true,
  primaryTo = "/how-it-works",
  primaryLabel = "How it works",
}: EmptyStateProps) {
  return (
    <div className="space-y-5 rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 sm:px-8">
      <div className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <p className="font-heading text-2xl tracking-tight sm:text-3xl">{title}</p>
        <div className="max-w-xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
      {cta ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={primaryTo}>{primaryLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/plans">Browse plans</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
