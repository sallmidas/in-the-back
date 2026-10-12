import { useState } from "react"
import { AuthForm } from "@/components/account/AuthForm"
import { EmptyState } from "@/components/layout/EmptyState"
import { ReportCard } from "@/components/report/ReportCard"
import { Button } from "@/components/ui/button"
import { claimChair, logoutAccount } from "@/lib/api"
import { useBoard } from "@/lib/board"
import { useSession } from "@/lib/session"

export function StaffQueuePage() {
  const { ready, user, chair, refresh } = useSession()
  const board = useBoard()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const queue = chair.mine ? board.recentReports(99) : []

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

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Platform chair
        </p>
        <h1 className="font-heading text-4xl tracking-tight">This is my queue</h1>
        <p className="max-w-2xl text-muted-foreground">
          One staff queue for the whole platform. Sign in, then claim it if it is still open. The
          claim is stored on the server, once. It is not a workplace.
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
          <AuthForm />
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
            <section className="space-y-3">
              <div>
                <h2 className="font-heading text-2xl">Queue</h2>
                <p className="text-sm text-muted-foreground">
                  Files across the platform. The public still never sees you.
                </p>
              </div>
              {!board.ready ? (
                <p className="text-sm text-muted-foreground">Opening the queue…</p>
              ) : board.error ? (
                <p role="alert" className="text-sm text-destructive">
                  {board.error}
                </p>
              ) : queue.length === 0 ? (
                <EmptyState title="No files in the queue." cta={false}>
                  <p>Nothing has been filed yet.</p>
                </EmptyState>
              ) : (
                <div className="grid gap-3">
                  {queue.map((report) => (
                    <ReportCard key={report.id} report={report} workplace={report.workplace} />
                  ))}
                </div>
              )}
            </section>
          ) : chair.claimed ? (
            <p className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
              The platform chair is already claimed. This queue belongs to the platform, once — not
              to a workplace, and not to this account.
            </p>
          ) : (
            <div className="space-y-3 rounded-xl border border-border bg-card/70 p-5">
              <p className="text-sm text-muted-foreground">
                Claim the platform chair once. There is no workplace to pick.
              </p>
              <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={() => void onClaim()}>
                {pending ? "Claiming…" : "This is my queue"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
