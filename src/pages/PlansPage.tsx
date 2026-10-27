import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function PlansPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          For everyone
        </p>
        <h1 className="font-heading text-4xl tracking-tight">
          Free for everyone reading and filing
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Reading and filing are always free. Looking at the board costs nothing. Store plans are
          a later model, and they are not for sale during the preview.
        </p>
      </header>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/workplaces">Read the board</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/stores">For stores</Link>
        </Button>
      </div>
    </div>
  )
}
