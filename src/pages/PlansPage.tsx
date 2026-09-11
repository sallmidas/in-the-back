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
import { cn, focusRingClass } from "@/lib/utils"

export function PlansPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            Operator plans
          </p>
          <Badge variant="outline">Preview only — no checkout yet</Badge>
        </div>
        <h1 className="font-heading text-4xl tracking-tight">Free, Watch, Respond</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pricing is a preview. Looking now costs nothing. Watch and Respond are kitchen
          tools — they are not how you sit the platform chair.
        </p>
        <HoldNotice />
      </header>

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
                <span className="text-sm text-muted-foreground">/mo preview</span>
                {plan.perReport > 0 ? (
                  <span className="block text-sm font-sans text-muted-foreground">
                    + {formatMoney(plan.perReport)} / published report · preview
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
              <Button asChild className="w-full" variant="outline">
                <Link to={plan.id === "free" ? "/workplaces" : "/how-it-works"}>
                  {plan.id === "free" ? "Read the board" : "Preview only"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        No Stripe. No card on file. Payouts and Watch billing stay held until the LLC. Platform
        chair is{" "}
        <Link
          to="/staff"
          className={cn("rounded-sm underline-offset-4 hover:underline", focusRingClass)}
        >
          This is my queue
        </Link>
        , claimed once — not a workplace listing, not a Watch or Respond plan.
      </p>
    </div>
  )
}
