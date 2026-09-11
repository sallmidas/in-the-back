import { Link } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"
import { cn, focusRingClass } from "@/lib/utils"

export function NotFoundPage() {
  return (
    <EmptyState
      eyebrow="Off the map"
      title="Not on this board."
      primaryTo="/"
      primaryLabel="Back to the board"
      titleAs="h1"
    >
      <p>
        That route isn&apos;t part of this build. Try the board, or open the directory if you were
        looking for a room.
      </p>
      <p>
        <Link
          to="/workplaces"
          className={cn("rounded-sm text-foreground underline-offset-4 hover:underline", focusRingClass)}
        >
          Open directory
        </Link>
      </p>
    </EmptyState>
  )
}
