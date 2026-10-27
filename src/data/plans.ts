import { storePriceLabel } from "../../shared/plan-copy.mjs"
import type { PlanId } from "./types"

export type Plan = {
  id: PlanId
  name: string
  monthly: number
  /** Flat monthly price in the planned store model. */
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
    tagline: "Not a store plan.",
    audience: "Not offered on this page",
    features: ["Stores are not on a free plan"],
    held: null,
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    priceLabel: storePriceLabel(129),
    tagline: "The store pays $129/mo for near-real-time alerts.",
    audience: "A store that would want alerts when a new report is on its rooms",
    features: [
      "Near-real-time alerts when a new report is on this store",
      "The same anonymous reports, with no name attached",
    ],
    held: later,
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    priceLabel: storePriceLabel(249),
    tagline: "The store pays $249/mo. A store could answer a report, or mark it under review, and the room score would come back faster.",
    audience: "A store that would want to respond and recover a rating faster",
    features: [
      "Everything on Watch",
      "Answer a report, or mark it under review, so the room score can come back faster",
    ],
    held: later,
  },
]
