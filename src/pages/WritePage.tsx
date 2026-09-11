import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getWorkplaces } from "@/data/catalog"
import { ROOM_KINDS, ROOM_LABELS } from "@/data/types"

export function WritePage() {
  const workplaces = getWorkplaces()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Pay-on-publish — not implemented
        </p>
        <h1 className="font-heading text-4xl tracking-tight">File a report</h1>
        <p className="text-muted-foreground">
          Drafting is free. A report is meant to bill Watch/Respond workplaces only when it
          publishes. That pipeline, Stripe, and reviewer identity checks are stubs. The form
          below does not submit.
        </p>
      </header>
      <form
        className="space-y-4 rounded-xl border border-border bg-card/70 p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <Label>Workplace</Label>
          <Select disabled>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder={workplaces[0]?.name ?? "Empty directory"} />
            </SelectTrigger>
            <SelectContent>
              {workplaces.map((workplace) => (
                <SelectItem key={workplace.id} value={workplace.id}>
                  {workplace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Room</Label>
          <Select disabled>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder={ROOM_LABELS[ROOM_KINDS[0]]} />
            </SelectTrigger>
            <SelectContent>
              {ROOM_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {ROOM_LABELS[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="excerpt">Writing</Label>
          <Textarea
            id="excerpt"
            disabled
            className="mt-1.5"
            placeholder="Room, what happened, what it felt like. No names."
          />
        </div>
        <Button type="button" disabled>
          Publish (disabled)
        </Button>
      </form>
      <Button asChild variant="outline">
        <Link to="/">Read recent reports</Link>
      </Button>
    </div>
  )
}
