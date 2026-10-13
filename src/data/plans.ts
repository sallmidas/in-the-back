import { kitchenPriceLabel } from "../../shared/plan-copy.mjs"
import type { PlanId } from "./types"

export type Plan = {
  id: PlanId
  name: string
  monthly: number
  /** Flat price sentence. Reporter pay is inside the subscription, not a toll. */
  priceLabel: string
  tagline: string
  audience: string
  features: string[]
  held: string | null
}

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
      "Dispute badges when a kitchen has flagged a report",
    ],
    held: null,
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    priceLabel: kitchenPriceLabel(129, 3),
    tagline: "The kitchen can see new files as they land.",
    audience: "A kitchen that needs to see files as they land",
    features: [
      "Everything on Free",
      "See new files as they land",
      "The $3 is reporter pay from the subscription, not an extra charge",
    ],
    held: "Billing held until the LLC. No card on file.",
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    priceLabel: kitchenPriceLabel(249, 5),
    tagline: "The kitchen can flag a report.",
    audience: "A kitchen that needs to flag a report",
    features: [
      "Everything on Watch",
      "Flag a report. A flag leads to uphold or retract — never delete.",
      "The $5 is reporter pay from the subscription, not an extra charge",
    ],
    held: "Billing held until the LLC. No card on file.",
  },
]
