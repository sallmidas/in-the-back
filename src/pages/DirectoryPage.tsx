import { useSearchParams } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"
import { WorkplaceCard } from "@/components/workplace/WorkplaceCard"
import { Button } from "@/components/ui/button"
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
  isIndustry,
  isRoomKind,
  type Industry,
  type RoomKind,
} from "@/data/types"

type Band = "all" | "struggling" | "mixed" | "solid"
const BANDS: Band[] = ["all", "struggling", "mixed", "solid"]

function asBand(value: string | null): Band {
  if (value && (BANDS as string[]).includes(value)) return value as Band
  return "all"
}

export function DirectoryPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? ""
  const industryParam = params.get("industry")
  const roomParam = params.get("room")
  const industry: Industry | "all" =
    industryParam && isIndustry(industryParam) ? industryParam : "all"
  const room: RoomKind | "all" = roomParam && isRoomKind(roomParam) ? roomParam : "all"
  const band = asBand(params.get("band"))

  const seeded = getWorkplaces().length
  const results = filterWorkplaces({ query, industry, room, band })
  const filtersOn = Boolean(query) || industry !== "all" || room !== "all" || band !== "all"

  function patch(next: Record<string, string>) {
    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") merged.delete(key)
      else merged.set(key, value)
    }
    setParams(merged, { replace: true })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Workplace directory
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Find a building, then a room</h1>
        <p className="max-w-2xl text-muted-foreground">
          Search name, city, or room. Filters live in the URL so you can share a view.
          {isDemoSeedEnabled()
            ? " Every listing here is a labeled DEMO sample."
            : " The launch directory is empty until real workplaces are added."}
        </p>
      </header>

      {isDemoSeedEnabled() ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => event.preventDefault()}
        >
        <div className="sm:col-span-2 lg:col-span-4">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            value={query}
            onChange={(event) => patch({ q: event.target.value })}
            placeholder="Harbor, Cicero, walk-in…"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Industry</Label>
          <Select value={industry} onValueChange={(value) => patch({ industry: value })}>
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
          <Select value={room} onValueChange={(value) => patch({ room: value })}>
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
          <Select value={band} onValueChange={(value) => patch({ band: value })}>
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
        <div className="flex items-end justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {results.length} of {seeded}
          </span>
          {filtersOn ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setParams({})}>
              Clear
            </Button>
          ) : null}
        </div>
        </form>
      ) : null}

      {!isDemoSeedEnabled() ? (
        <EmptyState eyebrow="Directory" title="Board is quiet.">
          <p>
            No rooms scored here yet. Be the first honest mark — cleanliness, safety, dignity.
          </p>
        </EmptyState>
      ) : results.length === 0 ? (
        <EmptyState
          eyebrow="Filters"
          title="Nothing matches."
          primaryTo="/workplaces"
          primaryLabel="Clear filters"
        >
          <p>Loosen the filters, or open a room and leave the first score.</p>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((workplace) => (
            <WorkplaceCard key={workplace.id} workplace={workplace} />
          ))}
        </div>
      )}
    </div>
  )
}
