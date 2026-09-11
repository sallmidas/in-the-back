import { useMemo, useState } from "react"
import { WorkplaceCard } from "@/components/workplace/WorkplaceCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { filterWorkplaces, getWorkplaces } from "@/data/catalog"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import {
  INDUSTRIES,
  INDUSTRY_LABELS,
  ROOM_KINDS,
  ROOM_LABELS,
  type Industry,
  type RoomKind,
} from "@/data/types"

type Band = "all" | "struggling" | "mixed" | "solid"

export function DirectoryPage() {
  const [query, setQuery] = useState("")
  const [industry, setIndustry] = useState<Industry | "all">("all")
  const [room, setRoom] = useState<RoomKind | "all">("all")
  const [band, setBand] = useState<Band>("all")

  const seeded = getWorkplaces().length
  const results = useMemo(
    () => filterWorkplaces({ query, industry, room, band }),
    [query, industry, room, band],
  )

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Workplace directory
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Find a building, then a room</h1>
        <p className="max-w-2xl text-muted-foreground">
          Search by name or city. Filter by industry, room, or score band. Every listing here is
          a labeled DEMO sample until you strip the seed.
        </p>
      </header>

      <form
        className="grid gap-3 rounded-xl border border-border bg-card/60 p-4 md:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="md:col-span-4">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Harbor, Cicero, walk-in…"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Industry</Label>
          <Select
            value={industry}
            onValueChange={(value) => setIndustry(value as Industry | "all")}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {INDUSTRIES.map((id) => (
                <SelectItem key={id} value={id}>
                  {INDUSTRY_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Room</Label>
          <Select
            value={room}
            onValueChange={(value) => setRoom(value as RoomKind | "all")}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Any room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any room</SelectItem>
              {ROOM_KINDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {ROOM_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Score band</Label>
          <Select value={band} onValueChange={(value) => setBand(value as Band)}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Any score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any score</SelectItem>
              <SelectItem value="struggling">Struggling (≤4.5)</SelectItem>
              <SelectItem value="mixed">Mixed (4.6–7.4)</SelectItem>
              <SelectItem value="solid">Solid (≥7.5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end text-sm text-muted-foreground">
          {results.length} of {seeded} workplaces
        </div>
      </form>

      {!isDemoSeedEnabled() ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-heading text-xl">Empty directory</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Demo seed is stripped. This is the launch state — no workplaces until real ones are
            added.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-heading text-xl">No matches</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear a filter or try another room. Seeded names include Harbor & Rye, ParcelPath,
            and Northline Market.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((workplace) => (
            <WorkplaceCard key={workplace.id} workplace={workplace} />
          ))}
        </div>
      )}
    </div>
  )
}
