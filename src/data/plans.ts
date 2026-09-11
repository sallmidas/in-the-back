import type { PlanId } from "./types"

export type Plan = {
  id: PlanId
  name: string
  monthly: number
  perReport: number
  tagline: string
  audience: string
  features: string[]
  missing: string[]
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    perReport: 0,
    tagline: "The public board. Rooms, scores, writing.",
    audience: "Anyone reading the board",
    features: [
      "Workplace directory and room scores",
      "Anonymous excerpts — never reviewer identity",
      "Dispute badges when a chair has flagged a report",
    ],
    missing: ["No alerts", "No official replies", "No queue"],
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    perReport: 3,
    tagline: "Watch the queue — numbers shown for later; nothing bills now",
    audience: "Operators who need to see volume, not argue it",
    features: [
      "Everything on Free",
      "Staff queue of incoming published reports",
      "Volume alerts (stub in Phase 1)",
    ],
    missing: ["Held until LLC", "No alerts billed", "No public replies yet"],
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    perReport: 5,
    tagline: "Claim chair + dispute badge — numbers shown for later; nothing bills now",
    audience: "The staff chair who will answer for the rooms",
    features: [
      "Everything on Watch",
      "Official replies (not implemented yet)",
      "Dispute a report into UNDER REVIEW (badge lives; filing is a stub)",
    ],
    missing: ["Held until LLC", "No Stripe", "No card on file"],
  },
]
