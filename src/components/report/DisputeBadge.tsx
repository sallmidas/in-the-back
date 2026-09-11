import { AlertTriangle } from "lucide-react"

export function DisputeBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border border-destructive/50 bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-destructive uppercase ${className}`}
    >
      <AlertTriangle className="size-3" aria-hidden />
      DISPUTED — UNDER REVIEW
    </span>
  )
}
