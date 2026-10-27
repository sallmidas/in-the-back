import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function StoresLandingPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          For stores & businesses
        </p>
        <h1 className="font-heading text-4xl tracking-tight">For stores</h1>
        <p className="max-w-2xl text-muted-foreground">
          Claim a store to see its rooms, scores, and the reports already on those rooms. Reports
          are anonymous. Kitchens, pits, walk-ins, docks — the rooms, not the people in them.
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/stores/login">Claim your store</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/stores/plans">Store plans</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-2xl space-y-3">
        <h2 className="font-heading text-2xl tracking-tight">What a store would see</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>— The store’s rooms and room scores.</li>
          <li>— Reports already on those rooms. No name, email, or account on a report.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          A store cannot hide, edit, or delete a report. Alerts and a response are planned for
          later. They are not for sale during the preview, and nothing is charged now.
        </p>
      </section>
    </div>
  )
}
