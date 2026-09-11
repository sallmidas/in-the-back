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
      "Dispute badges when a kitchen has flagged a report",
    ],
    missing: ["No incoming-file view", "No flagging"],
  },
  {
    id: "watch",
    name: "Watch",
    monthly: 129,
    perReport: 3,
    tagline: "The kitchen can see new files as they land — numbers shown for later; nothing bills now",
    audience: "Operators who need to see reports as they land",
    features: [
      "Everything on Free",
      "See new files and reports as they land",
      "Volume alerts (stub in Phase 1)",
    ],
    missing: ["Held until LLC", "No alerts billed", "No flagging yet"],
  },
  {
    id: "respond",
    name: "Respond",
    monthly: 249,
    perReport: 5,
    tagline: "The kitchen can flag a report — numbers shown for later; nothing bills now",
    audience: "Operators who need to flag a report",
    features: [
      "Everything on Watch",
      "Flag a report. A flag leads to uphold or retract — never delete.",
      "Official replies (not implemented yet)",
    ],
    missing: ["Held until LLC", "No Stripe", "No card on file"],
  },
]
