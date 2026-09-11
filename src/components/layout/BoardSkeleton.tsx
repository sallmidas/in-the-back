import { cn } from "@/lib/utils"

type Variant = "board" | "directory" | "workplace"

const LABELS: Record<Variant, string> = {
  board: "Opening the board",
  directory: "Opening the directory",
  workplace: "Opening this workplace",
}

function Bar({ className }: { className?: string }) {
  return (
    <span
      className={cn("board-skel-bar block rounded-xl border border-border bg-card/80", className)}
      aria-hidden
    />
  )
}

/** Calm placeholder for catalog views. Respects prefers-reduced-motion via .board-skel-bar. */
export function BoardSkeleton({ variant = "board" }: { variant?: Variant }) {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">{LABELS[variant]}</p>
      {variant === "workplace" ? (
        <>
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <Bar className="h-4 w-28" />
              <Bar className="h-9 max-w-sm" />
              <Bar className="h-4 max-w-xs" />
            </div>
            <Bar className="h-24 w-full sm:w-36" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Bar className="h-20" />
            <Bar className="h-20" />
            <Bar className="h-20" />
            <Bar className="h-20" />
          </div>
          <Bar className="h-36" />
        </>
      ) : (
        <>
          <div className="space-y-3">
            <Bar className="h-3 w-36" />
            <Bar className="h-9 max-w-md" />
            <Bar className="h-4 max-w-lg" />
          </div>
          {variant === "directory" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Bar className="h-48" />
              <Bar className="h-48" />
            </div>
          ) : (
            <div className="grid gap-3">
              <Bar className="h-32" />
              <Bar className="h-32" />
              <Bar className="h-24" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
