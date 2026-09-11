export const ROOM_KINDS = [
  "kitchen",
  "dish-pit",
  "walk-in",
  "staff-bathroom",
  "break-room",
  "dock",
  "stock",
  "overnight",
] as const

export type RoomKind = (typeof ROOM_KINDS)[number]

export const INDUSTRIES = [
  "restaurant",
  "diner",
  "fine-dining",
  "pub",
  "hotel",
  "hospital",
  "logistics",
  "grocery",
  "auto",
  "banquet",
] as const

export type Industry = (typeof INDUSTRIES)[number]

export const PLAN_IDS = ["free", "watch", "respond"] as const
export type PlanId = (typeof PLAN_IDS)[number]

export type Room = {
  kind: RoomKind
  /** Seeded room score, 1–10. Public never sees who scored. */
  score: number
}

export type Workplace = {
  id: string
  slug: string
  name: string
  industry: Industry
  city: string
  region: string
  blurb: string
  rooms: Room[]
  listedPlan: PlanId
  demo: true
}

export type Report = {
  id: string
  workplaceId: string
  roomKind: RoomKind
  score: number
  /** Shift / station context — never a name, badge, or login. */
  context: string
  excerpt: string
  publishedAt: string
  disputed: boolean
}

export const ROOM_LABELS: Record<RoomKind, string> = {
  kitchen: "Kitchen",
  "dish-pit": "Dish pit",
  "walk-in": "Walk-in",
  "staff-bathroom": "Staff bathroom",
  "break-room": "Break room",
  dock: "Dock",
  stock: "Stock",
  overnight: "Overnight",
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  restaurant: "Restaurant",
  diner: "Diner / counter",
  "fine-dining": "Fine dining",
  pub: "Pub",
  hotel: "Hotel / inn",
  hospital: "Hospital",
  logistics: "Logistics",
  grocery: "Grocery",
  auto: "Auto / overnight shop",
  banquet: "Banquet / catering",
}

export function isRoomKind(value: string): value is RoomKind {
  return (ROOM_KINDS as readonly string[]).includes(value)
}

export function isIndustry(value: string): value is Industry {
  return (INDUSTRIES as readonly string[]).includes(value)
}
