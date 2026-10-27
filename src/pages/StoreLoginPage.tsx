import { Link, useNavigate } from "react-router-dom"
import { AuthForm } from "@/components/account/AuthForm"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/session"

export function StoreLoginPage() {
  const { ready, user } = useSession()
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          For stores
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Store sign-in</h1>
        <p className="max-w-2xl text-muted-foreground">
          A store account is separate from the platform chair. Use a work email if you have one.
          After sign-in you can claim the store. The claim waits for the chair. Notes on the board
          are anonymous.
        </p>
      </header>

      {!ready ? (
        <p className="text-sm text-muted-foreground">Checking the session…</p>
      ) : user?.kind === "store" ? (
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card/70 p-5">
          <p className="text-sm">
            Signed in as <span className="font-mono">{user.email}</span>
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/stores/dashboard">Go to the store dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card/70 p-5">
          {user?.kind === "reader" ? (
            <p className="text-sm text-muted-foreground">
              This browser already has a different sign-in. Store sign-in replaces that session.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Create a store account, or sign in if you already have one.
            </p>
          )}
          <AuthForm
            kind="store"
            idPrefix="store"
            createLabel="Create store account"
            onDone={() => navigate("/stores/dashboard")}
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Notes on the board are anonymous.{" "}
        <Link to="/stores" className="underline-offset-4 hover:underline">
          Back to For stores
        </Link>
      </p>
    </div>
  )
}
