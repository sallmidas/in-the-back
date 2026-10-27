import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  approveStoreClaim,
  chairStoreClaims,
  refuseStoreClaim,
  type ChairStoreClaim,
} from "@/lib/api"

export function StoreClaimsQueue({ active }: { active: boolean }) {
  const [claims, setClaims] = useState<ChairStoreClaim[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!active) return
    let cancel = false
    chairStoreClaims()
      .then((data) => {
        if (cancel) return
        setClaims(data.claims)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancel) return
        setError(err instanceof Error ? err.message : "Store claims didn't open.")
      })
    return () => {
      cancel = true
    }
  }, [active, reload])

  if (!active) return null

  async function onApprove(claim: ChairStoreClaim) {
    setBusyId(claim.id)
    setError(null)
    try {
      await approveStoreClaim(claim.id, claim.verifiedCount > 0)
      setNotice(
        claim.verifiedCount > 0
          ? "Added another verified claim for this store."
          : "Claim approved. The store can open its dashboard.",
      )
      setReload((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The claim was not approved.")
    } finally {
      setBusyId(null)
    }
  }

  async function onRefuse(claim: ChairStoreClaim) {
    setBusyId(claim.id)
    setError(null)
    try {
      await refuseStoreClaim(claim.id)
      setNotice("Claim refused.")
      setReload((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The claim was not refused.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-2xl">Store claims</h2>
        <p className="text-sm text-muted-foreground">
          A store stays pending until you approve it. One verified claim per store, unless you add
          another. Approving does not show who wrote a note.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      ) : null}
      {claims === null ? (
        <p className="text-sm text-muted-foreground">Opening store claims…</p>
      ) : claims.length === 0 ? (
        <p className="text-sm text-muted-foreground">No store claims yet.</p>
      ) : (
        <ul className="grid gap-3">
          {claims.map((claim) => (
            <li key={claim.id} className="space-y-2 rounded-xl border border-border bg-card/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading text-lg">{claim.businessName}</p>
                <Badge variant="outline">{claim.status}</Badge>
                {claim.freeInbox ? <Badge variant="outline">Free inbox</Badge> : null}
                {claim.verifiedCount > 0 ? <Badge variant="outline">Store already verified</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {claim.role} · work email <span className="font-mono text-foreground">{claim.workEmail}</span>
              </p>
              {claim.accountEmail && claim.accountEmail !== claim.workEmail ? (
                <p className="text-xs text-muted-foreground">
                  Store account <span className="font-mono">{claim.accountEmail}</span>
                </p>
              ) : null}
              {claim.status === "pending" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={busyId === claim.id}
                    onClick={() => void onApprove(claim)}
                  >
                    {busyId === claim.id
                      ? "Saving…"
                      : claim.verifiedCount > 0
                        ? "Add another verified claim"
                        : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={busyId === claim.id}
                    onClick={() => void onRefuse(claim)}
                  >
                    Refuse
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
