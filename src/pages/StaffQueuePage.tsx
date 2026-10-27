import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthForm } from "@/components/account/AuthForm"
import { StoreClaimsQueue } from "@/components/chair/StoreClaimsQueue"
import { EmptyState } from "@/components/layout/EmptyState"
import { ReportCard } from "@/components/report/ReportCard"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { isIndustry, isRoomKind, ROOM_LABELS, type Report, type Workplace } from "@/data/types"
import { chairReports, claimChair, hideReport, logoutAccount, unhideReport, type StaffReport } from "@/lib/api"
import { useBoard } from "@/lib/board"
import { useSession } from "@/lib/session"
import { cn, focusRingClass } from "@/lib/utils"

function asWorkplace(report: StaffReport): Workplace {
  return {
    id: report.workplaceSlug,
    slug: report.workplaceSlug,
    name: report.workplaceName,
    industry:
      report.workplaceIndustry && isIndustry(report.workplaceIndustry)
        ? report.workplaceIndustry
        : null,
    city: report.workplaceCity,
    region: report.workplaceRegion,
    blurb: "",
    rooms: [],
    listedPlan: "free",
    demo: false,
  }
}

function asReport(report: StaffReport): Report | null {
  if (!isRoomKind(report.roomKind)) return null
  return {
    id: report.id,
    workplaceId: report.workplaceSlug,
    roomKind: report.roomKind,
    score: report.score,
    context: report.context,
    excerpt: report.excerpt,
    publishedAt: report.publishedAt,
    disputed: report.disputed,
  }
}

export function StaffQueuePage() {
  const { ready, user, chair, refresh } = useSession()
  const board = useBoard()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [queue, setQueue] = useState<StaffReport[] | null>(null)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [hidingId, setHidingId] = useState<string | null>(null)
  const [sure, setSure] = useState(false)

  useEffect(() => {
    if (!chair.mine) return
    let cancel = false
    chairReports()
      .then((data) => {
        if (cancel) return
        setQueue(data.reports)
        setQueueError(null)
      })
      .catch((err: unknown) => {
        if (cancel) return
        setQueueError(err instanceof Error ? err.message : "The queue didn't open.")
      })
    return () => {
      cancel = true
    }
  }, [chair.mine, reload])

  async function onClaim() {
    setPending(true)
    setError(null)
    try {
      await claimChair()
      await refresh()
      setNotice("You claimed the platform chair. The public board still does not show who.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "The chair was not claimed.")
    } finally {
      setPending(false)
    }
  }

  async function onSignOut() {
    await logoutAccount()
    await refresh()
    setNotice("Signed out. The chair claim stays on the server.")
  }

  async function onToggle(report: StaffReport) {
    setHidingId(report.id)
    setError(null)
    try {
      if (report.hidden) await unhideReport(report.id)
      else await hideReport(report.id)
      setNotice(report.hidden ? "Back on the public board." : "Hidden from the public board.")
      setReload((value) => value + 1)
      await board.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "That filing was not updated.")
    } finally {
      setHidingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Platform chair
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Platform chair</h1>
        <p className="max-w-2xl text-muted-foreground">
          One staff queue for the whole platform. Sign in, then claim it if it is still open. The
          claim is stored on the server, once. From this queue you can hide
          a published filing that breaks the{" "}
          <Link to="/content" className={cn("rounded-sm underline-offset-4 hover:underline", focusRingClass)}>
            content policy
          </Link>
          , and put it back. Hiding takes it off the public board. It does not delete it, and it is
          not the filer's retract.
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

      {!ready ? (
        <p className="text-sm text-muted-foreground">Checking the chair…</p>
      ) : !user ? (
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card/70 p-5">
          <p className="text-sm text-muted-foreground">
            {chair.claimed
              ? "The chair is already claimed. Sign in only if this is your account."
              : "Create an account, then claim the chair. The first account to claim it is the only one."}
          </p>
          <AuthForm kind="reader" />
        </div>
      ) : user.kind === "store" ? (
        <div className="max-w-xl space-y-3 rounded-xl border border-border bg-card/70 p-5">
          <p className="text-sm">
            Signed in as store account <span className="font-mono">{user.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            A store account cannot claim the platform chair. The chair is one seat for In the
            Back, not for a store.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/stores/dashboard">Store dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => void onSignOut()}>
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-4">
            <p className="text-sm">
              Signed in as <span className="font-mono">{user.email}</span>
              <span className="block text-xs text-muted-foreground">
                This address is never shown on the public board.
              </span>
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => void onSignOut()}>
              Sign out
            </Button>
          </div>

          {chair.mine ? (
            <>
            <StoreClaimsQueue active={chair.mine} />
            <section className="space-y-3">
              <div>
                <h2 className="font-heading text-2xl">Queue</h2>
                <p className="text-sm text-muted-foreground">
                  Reports on the board, including ones you have hidden. The public still never sees you.
                </p>
              </div>
              {queueError ? (
                <p role="alert" className="text-sm text-destructive">
                  {queueError}
                </p>
              ) : queue === null ? (
                <p className="text-sm text-muted-foreground">Opening the queue…</p>
              ) : queue.length === 0 ? (
                <EmptyState title="No files in the queue." cta={false}>
                  <p>Nothing has been filed on the server yet.</p>
                </EmptyState>
              ) : (
                <div className="grid gap-3">
                  {queue.map((report) => {
                    const card = asReport(report)
                    if (!card) return null
                    return (
                      <div key={report.id} className="space-y-2">
                        <ReportCard report={card} workplace={asWorkplace(report)} />
                        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            {report.hidden
                              ? "Hidden from the public board."
                              : `${report.workplaceName} · ${isRoomKind(report.roomKind) ? ROOM_LABELS[report.roomKind] : report.roomKind} is on the board.`}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            disabled={hidingId === report.id}
                            onClick={() => void onToggle(report)}
                          >
                            {hidingId === report.id
                              ? "Saving…"
                              : report.hidden
                                ? "Put back on the board"
                                : "Hide from the board"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
            </>
          ) : chair.claimed ? (
            <p className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
              The platform chair is already claimed. This account is not the chair.
            </p>
          ) : (
            <div className="space-y-3 rounded-xl border border-border bg-card/70 p-5">
              <p className="text-sm text-muted-foreground">
                Claim the platform chair once. This is one seat for the whole board, and it does
                not reopen.
              </p>
              <div className="flex items-start gap-3">
                <input
                  id="chair-sure"
                  type="checkbox"
                  checked={sure}
                  onChange={(event) => setSure(event.target.checked)}
                  className="mt-1 size-6 accent-primary"
                />
                <Label htmlFor="chair-sure" className="text-sm leading-relaxed">
                  I understand this can be claimed once, for the whole board.
                </Label>
              </div>
              <Button type="button" className="w-full sm:w-auto" disabled={pending || !sure} onClick={() => void onClaim()}>
                {pending ? "Claiming…" : "This is my queue"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
