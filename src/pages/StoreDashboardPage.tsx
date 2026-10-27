import { type FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ReportCard } from "@/components/report/ReportCard"
import { RoomScore } from "@/components/room/RoomScore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isIndustry, isRoomKind, INDUSTRY_LABELS, type Report, type Workplace } from "@/data/types"
import {
  logoutAccount,
  storeHome,
  submitStoreClaim,
  type LiveReport,
  type LiveWorkplace,
  type StoreClaim,
} from "@/lib/api"
import { useSession } from "@/lib/session"

function asWorkplace(workplace: LiveWorkplace): Workplace {
  return {
    id: workplace.slug,
    slug: workplace.slug,
    name: workplace.name,
    industry: workplace.industry && isIndustry(workplace.industry) ? workplace.industry : null,
    city: workplace.city,
    region: workplace.region,
    blurb: "",
    rooms: workplace.rooms.filter((room) => isRoomKind(room.kind)).map((room) => ({
      kind: room.kind as Workplace["rooms"][number]["kind"],
      score: room.score,
    })),
    listedPlan: "free",
    demo: false,
  }
}

function asReport(report: LiveReport, workplace: Workplace): Report | null {
  if (!isRoomKind(report.roomKind)) return null
  return {
    id: report.id,
    workplaceId: workplace.id,
    roomKind: report.roomKind,
    score: report.score,
    context: report.context,
    excerpt: report.excerpt,
    publishedAt: report.publishedAt,
    disputed: report.disputed,
  }
}

function ClaimForm({
  email,
  onDone,
}: {
  email: string
  onDone: () => void
}) {
  const [businessName, setBusinessName] = useState("")
  const [role, setRole] = useState("")
  const [workEmail, setWorkEmail] = useState(email)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await submitStoreClaim({ businessName, role, workEmail })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "The claim was not sent.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3 rounded-xl border border-border bg-card/70 p-5">
      <h2 className="font-heading text-2xl">Claim your store</h2>
      <p className="text-sm text-muted-foreground">
        The claim stays pending until the platform chair approves it. Use a title for your role,
        not your name. A work email on the store’s own domain is easier to check. A free inbox can
        still be sent. Nothing is verified automatically, and nothing is charged.
      </p>
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="claim-business">Business name</Label>
        <Input
          id="claim-business"
          required
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="claim-role">Your role</Label>
        <Input
          id="claim-role"
          required
          placeholder="General manager"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="claim-email">Work email</Label>
        <Input
          id="claim-email"
          type="email"
          required
          value={workEmail}
          onChange={(event) => setWorkEmail(event.target.value)}
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Submit claim"}
      </Button>
    </form>
  )
}

function PendingClaim({ claim }: { claim: StoreClaim }) {
  return (
    <section className="max-w-xl space-y-3 rounded-xl border border-border bg-card/70 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-2xl">Claim pending</h2>
        <Badge variant="outline">Waiting for the chair</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {claim.businessName} is not verified yet. You will not see a store dashboard until the
        platform chair approves this claim. One verified claim per store, unless the chair adds
        another.
      </p>
      <dl className="space-y-1 text-sm">
        <div>
          <dt className="text-muted-foreground">Business</dt>
          <dd>{claim.businessName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd>{claim.role}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Work email</dt>
          <dd className="font-mono">{claim.workEmail}</dd>
        </div>
      </dl>
      {claim.freeInbox ? (
        <p className="text-xs text-muted-foreground">
          This is a free inbox, not the store’s own domain. The chair can still approve it.
        </p>
      ) : null}
    </section>
  )
}

function PlannedActions() {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl">Planned, not in this preview</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border bg-card/70 p-4">
          <h3 className="font-heading text-lg">Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Planned. A store would be told when a new note is on this store. Not included during
            this preview.
          </p>
          <Button type="button" variant="outline" disabled>
            Planned
          </Button>
        </div>
        <div className="space-y-2 rounded-xl border border-border bg-card/70 p-4">
          <h3 className="font-heading text-lg">Respond or dispute</h3>
          <p className="text-sm text-muted-foreground">
            Planned. A store would respond or dispute, and recover a rating faster. Not included
            during this preview.
          </p>
          <Button type="button" variant="outline" disabled>
            Planned
          </Button>
        </div>
      </div>
    </section>
  )
}

export function StoreDashboardPage() {
  const { ready, user, refresh } = useSession()
  const [claim, setClaim] = useState<StoreClaim | null | undefined>(undefined)
  const [stores, setStores] = useState<StoreHomeStores>([])
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!ready || user?.kind !== "store") return
    let cancel = false
    storeHome()
      .then((data) => {
        if (cancel) return
        setClaim(data.claim)
        setStores(data.stores)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancel) return
        setError(err instanceof Error ? err.message : "The store page didn't open.")
      })
    return () => {
      cancel = true
    }
  }, [ready, user?.kind, reload])

  async function onSignOut() {
    await logoutAccount()
    await refresh()
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">For stores</p>
        <h1 className="font-heading text-4xl tracking-tight">Store dashboard</h1>
        <p className="max-w-2xl text-muted-foreground">
          Rooms, scores, and the notes on this store. The notes are anonymous.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!ready ? (
        <p className="text-sm text-muted-foreground">Checking the session…</p>
      ) : !user ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Sign in with a store account to claim a store.</p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/stores/login">Store sign-in</Link>
          </Button>
        </div>
      ) : user.kind !== "store" ? (
        <div className="max-w-md space-y-3">
          <p className="text-sm text-muted-foreground">
            This sign-in is not a store account. Store accounts are separate.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/stores/login">Store sign-in</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-4">
            <p className="text-sm">
              Store account <span className="font-mono">{user.email}</span>
              <span className="block text-xs text-muted-foreground">
                This address is never shown on the public board.
              </span>
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => void onSignOut()}>
              Sign out
            </Button>
          </div>

          {claim === undefined ? (
            <p className="text-sm text-muted-foreground">Opening the store…</p>
          ) : claim?.status === "pending" ? (
            <PendingClaim claim={claim} />
          ) : claim?.status === "approved" ? (
            <ApprovedStore stores={stores} />
          ) : (
            <div className="space-y-4">
              {claim?.status === "refused" ? (
                <p className="text-sm text-muted-foreground">
                  The chair refused the claim for {claim.businessName}. You can send a new one.
                </p>
              ) : null}
              <ClaimForm email={user.email} onDone={() => setReload((value) => value + 1)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type StoreHomeStores = { workplace: LiveWorkplace; reports: LiveReport[] }[]

function ApprovedStore({ stores }: { stores: StoreHomeStores }) {
  const place = stores[0]
  if (!place) {
    return <p className="text-sm text-muted-foreground">The claim is verified, but the store record is missing.</p>
  }
  const workplace = asWorkplace(place.workplace)
  const placeLabel = [workplace.city, workplace.region].filter(Boolean).join(", ")

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-3xl tracking-tight">{workplace.name}</h2>
          <Badge variant="outline">Verified</Badge>
        </div>
        {placeLabel ? <p className="text-muted-foreground">{placeLabel}</p> : null}
        {workplace.industry ? (
          <p className="text-sm text-muted-foreground">{INDUSTRY_LABELS[workplace.industry]}</p>
        ) : null}
        <p className="max-w-2xl text-sm text-muted-foreground">
          You cannot hide, edit, or delete a note. The notes are anonymous.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl">Rooms</h2>
        {workplace.rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scored rooms yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {workplace.rooms.map((room) => (
              <RoomScore key={room.kind} room={room} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl">Notes</h2>
        {place.reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes on this store yet.</p>
        ) : (
          <div className="grid gap-3">
            {place.reports.map((report) => {
              const card = asReport(report, workplace)
              if (!card) return null
              return <ReportCard key={report.id} report={card} workplace={workplace} showWorkplace={false} />
            })}
          </div>
        )}
      </section>

      <PlannedActions />
    </div>
  )
}
