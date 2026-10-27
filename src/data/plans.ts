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
    audience: "A store that would want alerts when a new note is on its rooms",
    features: [
      "Near-real-time alerts when a new note is on this store",
      "The same anonymous notes, with no name attached",
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
