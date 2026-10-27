import { storePriceLabel } from "../../shared/plan-copy.mjs"
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
    priceLabel: storePriceLabel(0),
    tagline: "The public board. Not a store plan.",
    audience: "Readers on the public board",
    features: [
      "Workplace directory and room scores",
      "Anonymous excerpts — never reviewer identity",
    ],
    held: null,
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    priceLabel: storePriceLabel(129),
    tagline: "The store pays $129/mo for near-real-time alerts.",
    audience: "A store that would want alerts as files land",
    features: [
      "Near-real-time alerts when a filing lands",
      "The same anonymous writing the public sees",
    ],
    held: later,
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    priceLabel: storePriceLabel(249),
    tagline: "The store pays $249/mo. Adds a response or dispute and a faster way to recover the rating.",
    audience: "A store that would want to respond and recover a rating faster",
    features: [
      "Everything on Watch",
      "Respond or dispute a filing, and recover the room rating faster",
    ],
    held: later,
  },
]
