import { Link } from "react-router-dom"
import { RoomScore } from "@/components/room/RoomScore"
import type { Room } from "@/data/types"

const HOW_IT_WORKS_STEPS = [
  {
    n: "01",
    title: "Score the room",
    body: "Walk-ins, dish pits, docks, overnight. Cleanliness, safety, and dignity get a number — not a personality, and not a résumé.",
  },
  {
    n: "02",
    title: "Write without a name",
    body: "The board shows the room, the score, the shift context, and the writing. Reviewer identity never publishes.",
  },
  {
    n: "03",
    title: "Disputes stay a badge",
    body: "A staff chair can flag a report. The public sees DISPUTED — UNDER REVIEW, not a pile-on with a person.",
  },
  {
    n: "04",
    title: "One chair, privately",
    body: "The designated staff chair claims a queue. Reading the board is free. Watch and Respond stay preview-only until the LLC.",
  },
] as const

const SAMPLE_ROOMS: Room[] = [
  { kind: "walk-in", score: 3.2 },
  { kind: "dish-pit", score: 4.1 },
  { kind: "kitchen", score: 6.4 },
  { kind: "break-room", score: 5.0 },
]

export function HowItWorksSteps({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {HOW_IT_WORKS_STEPS.map((step) => (
        <li
          key={step.n}
          className="flex h-full flex-col rounded-xl border border-border bg-card/80 p-4"
        >
          <span className="font-mono text-[11px] tracking-[0.18em] text-primary">{step.n}</span>
          <span className="font-heading mt-2 text-lg tracking-tight">{step.title}</span>
          <span className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</span>
        </li>
      ))}
    </ol>
  )
}

export function HowItWorksPreview() {
  return (
    <section id="how-it-works" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
            How it works
          </p>
          <h2 className="font-heading text-2xl tracking-tight">Rooms. Scores. No names.</h2>
        </div>
        <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
          Full walkthrough
        </Link>
      </div>
      <HowItWorksSteps compact />
    </section>
  )
}

export function SampleRoomStrip() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Example room scores — illustration, not a listing.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SAMPLE_ROOMS.map((room) => (
          <RoomScore key={room.kind} room={room} />
        ))}
      </div>
    </div>
  )
}
