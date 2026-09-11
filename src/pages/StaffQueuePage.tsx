import { type FormEvent, useMemo, useState } from "react"
import { EmptyState } from "@/components/layout/EmptyState"
import { ReportCard } from "@/components/report/ReportCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isDemoSeedEnabled } from "@/data/demo-flag"
import { recentReports } from "@/data/catalog"
import {
  claimQueue,
  getStaffSession,
  releaseQueue,
  signInStaff,
  signOutStaff,
  type StaffSession,
} from "@/lib/staff-session"

export function StaffQueuePage() {
  const [session, setSession] = useState<StaffSession | null>(() => getStaffSession())
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const claimed = Boolean(session?.claimed)
  const queue = useMemo(() => (claimed ? recentReports(99) : []), [claimed])

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
    const next = claimQueue()
    if (!next) {
      setError("Sign in first, then claim the platform chair.")
      return
    }
    setError(null)
    setSession(next)
    setNotice(
      "Platform chair claimed once for In the Back. Public still never sees you. This is not Watch, not Respond, and not a workplace listing.",
    )
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
            ? "In the Back's platform chair — claimed once, not per workplace, not Watch, not Respond. Sign in with any email, then This is my queue. This browser only — no OAuth. Flagging is a stub: uphold or retract, never delete."
            : "In the Back's platform chair — claimed once for the platform, not a workplace listing, not a Watch or Respond plan. Sign in below to practice the claim flow. Payouts and Watch billing stay held until the LLC."}
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

          {!claimed ? (
            <form
              onSubmit={onClaim}
              className="space-y-3 rounded-xl border border-border bg-card/70 p-5"
            >
              <p className="text-sm text-muted-foreground">
                Claim In the Back&apos;s platform chair once. This is not a workplace to pick, and
                not Watch or Respond.
              </p>
              <Button type="submit" className="w-full sm:w-auto">
                This is my queue
              </Button>
            </form>
          ) : (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading text-2xl">Queue</h2>
                  <p className="text-sm text-muted-foreground">
                    Platform chair — files across the board. Public still never sees you.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setSession(releaseQueue())
                    setNotice("Chair released. Another platform chair can claim later.")
                  }}
                >
                  Release chair
                </Button>
              </div>
              {queue.length === 0 ? (
                <EmptyState title="Your queue is empty." cta={false}>
                  <p>
                    No published reports in the platform queue yet. You already claimed the chair —
                    hang tight, or restore demo seed from the README if you&apos;re testing.
                  </p>
                </EmptyState>
              ) : (
                <div className="grid gap-3">
                  {queue.map((report) => (
                    <div key={report.id} className="space-y-2">
                      <ReportCard report={report} workplace={report.workplace} />
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
          )}
        </div>
      )}
    </div>
  )
}
