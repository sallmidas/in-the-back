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

export function PlansPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            For stores & businesses
          </p>
          <Badge variant="outline">Planned, coming later</Badge>
        </div>
        <h1 className="font-heading text-4xl tracking-tight">Plans for stores</h1>
        <p className="max-w-2xl text-muted-foreground">
          Reading and filing are always free. Stores would pay for alerts — planned for later, not
          for sale during the preview.
        </p>
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
        The{" "}
        <Link
          to="/staff"
          className={cn("rounded-sm underline-offset-4 hover:underline", focusRingClass)}
        >
          platform chair
        </Link>{" "}
        is claimed once for In the Back, not for a workplace.
      </p>
    </div>
  )
}
