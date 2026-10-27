import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteAccount } from "@/lib/api"
import { useSession } from "@/lib/session"

export function DeleteAccountPage() {
  const { refresh } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await deleteAccount(email, password)
      await refresh()
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The account was not deleted.")
    }
  }

  if (done) {
    return (
      <div className="max-w-lg space-y-3">
        <h1 className="font-heading text-4xl tracking-tight">Account deleted</h1>
        <p className="text-muted-foreground">
          The sign-in is gone. Files you already published stay on the board until you retract them
          with the receipt. Deleting an account does not delete a file.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Account</p>
      <h1 className="font-heading text-4xl tracking-tight">Delete account</h1>
      <p className="text-muted-foreground">
        This removes the email and password. It does not retract a filed report, and it cannot
        remove the moderator account. Retract a file from the filing page.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card/70 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="delete-email">Email</Label>
          <Input
            id="delete-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="delete-password">Password</Label>
          <Input
            id="delete-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" variant="destructive">
          Delete account
        </Button>
      </form>
    </div>
  )
}
