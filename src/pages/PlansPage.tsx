import { Link } from "react-router-dom"
import { HoldNotice } from "@/components/layout/HoldNotice"
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

export function PlansPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Operator plans
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Free, Watch, Respond</h1>
        <p className="max-w-2xl text-muted-foreground">
          Reading the board is free. Watch and Respond are for the staff chair. Nothing here
          charges a card.
        </p>
        <HoldNotice />
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.id === "respond" ? "ring-primary/40" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-2xl">{plan.name}</CardTitle>
                {plan.id === "respond" ? <Badge>Staff chair</Badge> : null}
              </div>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-3xl">
                {formatMoney(plan.monthly)}
                <span className="text-sm text-muted-foreground">/mo</span>
                {plan.perReport > 0 ? (
                  <span className="block text-sm font-sans text-muted-foreground">
                    + {formatMoney(plan.perReport)} / published report
                  </span>
                ) : (
                  <span className="block text-sm font-sans text-muted-foreground">
                    No per-report fee
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{plan.audience}</p>
              <ul className="space-y-1.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>— {feature}</li>
                ))}
              </ul>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {plan.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={plan.id === "free" ? "outline" : "default"}
              >
                <Link to={plan.id === "free" ? "/workplaces" : "/staff"}>
                  {plan.id === "free" ? "Read the board" : "Preview staff queue"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
