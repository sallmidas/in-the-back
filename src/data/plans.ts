import { kitchenPriceLabel } from "../../shared/plan-copy.mjs"
import type { PlanId } from "./types"

export type Plan = {
  id: PlanId
  name: string
  monthly: number
  /** Flat price sentence. Reporter pay would be inside the subscription, not a toll. */
  priceLabel: string
  tagline: string
  audience: string
  features: string[]
  held: string | null
}

const later = "Planned, coming later. Not a promise, and not charged during this preview."

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    priceLabel: kitchenPriceLabel(0, 0),
    tagline: "The public board. Rooms, scores, writing.",
    audience: "Anyone reading the board",
    features: [
      "Workplace directory and room scores",
      "Anonymous excerpts — never reviewer identity",
      "A dispute badge when a filing is under review",
    ],
    held: null,
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    priceLabel: kitchenPriceLabel(129, 3),
    tagline: "Planned: a facility would pay monthly for near-real-time alerts.",
    audience: "A facility that would want alerts as files land",
    features: [
      "Everything on Free",
      "Near-real-time alerts when a report is filed",
      "A reporter would earn $3 once the report passes review",
      "Reports shown to be false after a dispute earn nothing",
    ],
    held: later,
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    priceLabel: kitchenPriceLabel(249, 5),
    tagline: "Planned: alerts, plus a response or dispute and a faster way to recover the rating.",
    audience: "A facility that would want to respond and recover a rating faster",
    features: [
      "Everything on Watch",
      "Respond or dispute a filing, and recover the room rating faster",
      "A reporter would earn $5 once the report passes review",
      "Reports shown to be false after a dispute earn nothing",
    ],
    held: later,
  },
]
