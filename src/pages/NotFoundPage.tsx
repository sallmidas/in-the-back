import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-heading text-4xl tracking-tight">Not on this board</h1>
      <p className="text-muted-foreground">That route isn&apos;t part of Phase 1.</p>
      <Button asChild>
        <Link to="/">Back to recent reports</Link>
      </Button>
    </div>
  )
}
