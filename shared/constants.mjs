/** Room and industry ids. Keep in sync with src/data/types.ts (asserted in tests). */
export const ROOM_KINDS = [
  "kitchen",
  "dish-pit",
  "walk-in",
  "staff-bathroom",
  "break-room",
  "dock",
  "stock",
  "overnight",
]

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
]

const ROOM_INDEX = new Map(ROOM_KINDS.map((kind, index) => [kind, index]))

export function compareRooms(a, b) {
  return (ROOM_INDEX.get(a) ?? 99) - (ROOM_INDEX.get(b) ?? 99)
}
