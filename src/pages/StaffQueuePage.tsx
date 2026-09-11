import { type FormEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"
import { ReportCard } from "@/components/report/ReportCard"
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
import { getWorkplaceBySlug, getWorkplaces, reportsForWorkplace } from "@/data/catalog"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import {
  claimQueue,
  getStaffSession,
  releaseQueue,
  signInStaff,
  signOutStaff,
  type StaffSession,
} from "@/lib/staff-session"

const UNSET_WORKPLACE = "unset"

export function StaffQueuePage() {
  const [session, setSession] = useState<StaffSession | null>(() => getStaffSession())
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [claimSlug, setClaimSlug] = useState(session?.claimedSlug ?? UNSET_WORKPLACE)
  const [notice, setNotice] = useState<string | null>(null)

  const workplaces = getWorkplaces()
  const claimed = session?.claimedSlug ? getWorkplaceBySlug(session.claimedSlug) : undefined
  const queue = useMemo(
    () => (claimed ? reportsForWorkplace(claimed.id) : []),
    [claimed],
  )

  function onSignIn(event: FormEvent) {
    event.preventDefault()
    if (!email.includes("@")) {
      setError("Enter an email to sign in. This is a stub — no OAuth, no password.")
      return
    }
    setError(null)
    const next = signInStaff(email)
    setSession(next)
    setNotice("Signed in locally. Nothing left this browser.")
  }

  function onClaim(event: FormEvent) {
    event.preventDefault()
    if (!claimSlug || claimSlug === UNSET_WORKPLACE) {
      setError("Pick a workplace to claim as the platform chair.")
      return
    }
    setError(null)
    const next = claimQueue(claimSlug)
    setSession(next)
    setNotice("Queue claimed as In the Back's platform chair. Public still never sees you. This is not Watch or Respond.")
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Platform chair stub
        </p>
        <h1 className="font-heading text-4xl tracking-tight">This is my queue</h1>
        <p className="max-w-2xl text-muted-foreground">
          {isDemoSeedEnabled()
            ? "In the Back's platform chair — not Watch, not Respond. Sign in with any email, claim a DEMO workplace, read the queue. One chair per workplace. This browser only — no OAuth. Flagging is a stub: uphold or retract, never delete."
            : "In the Back's platform chair — not a Watch or Respond plan. One chair per workplace. Sign in below to practice the claim flow. Real workplaces to claim will appear here once listings are live — billing and publish stay held until the LLC."}
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      {workplaces.length === 0 && !session ? (
        <EmptyState title="No queue yet." cta={false}>
          <p>
            When workplaces land, In the Back's platform chair claims them here — not Watch or
            Respond. Sign-in stub still works in this browser.
          </p>
        </EmptyState>
      ) : null}

      {!session ? (
        <form onSubmit={onSignIn} className="max-w-md space-y-3 rounded-xl border border-border bg-card/70 p-5">
          <Label htmlFor="staff-email">Chair email (stub)</Label>
          <Input
            id="staff-email"
            type="email"
            autoComplete="username"
            placeholder="chair@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" className="w-full sm:w-auto">
            Sign in
          </Button>
          <p className="text-xs text-muted-foreground">
            No password, no provider. We store an email string in localStorage so you can demo
            the claim flow.
          </p>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-4">
            <p className="text-sm">
              Signed in as <span className="font-mono">{session.email}</span>
              <span className="block text-xs text-muted-foreground">
                This address is never shown on the public board.
              </span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                signOutStaff()
                setSession(null)
                setNotice("Signed out of this browser.")
              }}
            >
              Sign out
            </Button>
          </div>

          {workplaces.length > 0 ? (
            <form
              onSubmit={onClaim}
              className="grid gap-3 rounded-xl border border-border bg-card/70 p-5 md:grid-cols-[1fr_auto] md:items-end"
            >
              <div>
                <Label htmlFor="claim-workplace">Claim a workplace</Label>
                <Select value={claimSlug} onValueChange={setClaimSlug}>
                  <SelectTrigger id="claim-workplace" className="mt-1.5 w-full">
                    <SelectValue placeholder="Choose a DEMO workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSET_WORKPLACE}>Choose a DEMO workplace</SelectItem>
                    {workplaces.map((workplace) => (
                      <SelectItem key={workplace.slug} value={workplace.slug}>
                        {workplace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                This is my queue
              </Button>
            </form>
          ) : null}

          {workplaces.length === 0 ? (
            <EmptyState title="Your queue is empty." cta={false}>
              <p>
                No workplaces to claim until listings exist. This is the platform chair, not a
                Watch or Respond plan. You're signed in — hang tight or restore demo seed from the
                README if you're testing.
              </p>
            </EmptyState>
          ) : claimed ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-2xl">
                  Queue · {claimed.name}
                </h2>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link to={`/workplaces/${claimed.slug}`}>Public page</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSession(releaseQueue())
                      setClaimSlug(UNSET_WORKPLACE)
                      setNotice("Chair released. Another platform chair can claim later.")
                    }}
                  >
                    Release chair
                  </Button>
                </div>
              </div>
              {queue.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No published reports in this queue.
                </p>
              ) : (
                <div className="grid gap-3">
                  {queue.map((report) => (
                    <div key={report.id} className="space-y-2">
                      <ReportCard report={report} workplace={claimed} showWorkplace={false} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          setNotice(
                            "Flagging is a stub. A flag leads to uphold or retract — it does not delete the report. Seeded flags already show DISPUTED — UNDER REVIEW.",
                          )
                        }
                      >
                        Flag (stub)
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">
              Claim a workplace to see its published reports. You are not visible on the public
              board either way.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
