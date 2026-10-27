import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PLANS } from "@/data/plans"
import { formatMoney } from "@/lib/format"
import { cn, focusRingClass } from "@/lib/utils"

export function StoresLandingPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          For stores & businesses
        </p>
        <h1 className="font-heading text-4xl tracking-tight">For stores</h1>
        <p className="max-w-2xl text-muted-foreground">
          In the Back is a public board of the rooms in a building: kitchens, pits, walk-ins,
          docks. A store sees the same anonymous scores and writing the public sees. Never who
          filed them.
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/stores/login">Claim your store</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/stores/login">Store sign-in</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-2xl space-y-3">
        <h2 className="font-heading text-2xl tracking-tight">What a store would see</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>— The store’s rooms and room scores.</li>
          <li>— Published filings about those rooms, in the same anonymous view as the public board.</li>
          <li>— No reporter name, email, account, or receipt.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          A store cannot hide, edit, or delete a filing. The person who filed it can retract it.
          The platform chair can hide one that breaks the content policy. The chair is one seat
          for In the Back, not a seat a store can claim.
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl tracking-tight">Plans for stores</h2>
            <Badge variant="outline">Planned, coming later</Badge>
          </div>
          <p className="max-w-2xl text-muted-foreground">
            Reading and filing are always free. Stores would pay for alerts — planned for later,
            not for sale during the preview.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-mono text-3xl">
                  {formatMoney(plan.monthly)}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                <p className="text-sm leading-relaxed">{plan.priceLabel}</p>
                {plan.held ? <p className="text-xs text-muted-foreground">{plan.held}</p> : null}
                <p className="text-sm text-muted-foreground">{plan.audience}</p>
                <ul className="space-y-1.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature}>— {feature}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === "free" ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/workplaces">Read the board</Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Planned
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        The{" "}
        <Link
          to="/staff"
          className={cn("rounded-sm underline-offset-4 hover:underline", focusRingClass)}
        >
          platform chair
        </Link>{" "}
        approves a store claim. One verified claim per store, unless the chair adds another.
        Nothing on this page is for sale.
      </p>
    </div>
  )
}
