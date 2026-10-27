import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAccount, registerAccount, type AccountKind } from "@/lib/api"
import { useSession } from "@/lib/session"

export function AuthForm({
  onDone,
  createLabel = "Create account",
  kind = "reader",
  idPrefix = "account",
}: {
  onDone?: () => void
  createLabel?: string
  kind?: AccountKind
  idPrefix?: string
}) {
  const { refresh } = useSession()
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      if (mode === "create") await registerAccount(email, password, kind)
      else await loginAccount(email, password, kind)
      await refresh()
      setPassword("")
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-password`}>Password</Label>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          autoComplete={mode === "create" ? "new-password" : "current-password"}
          required
          minLength={mode === "create" ? 10 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {mode === "create" ? (
          <p className="text-xs text-muted-foreground">At least 10 characters. Stored on the server, not in this browser.</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Working…" : mode === "create" ? createLabel : "Sign in"}
      </Button>
      <button
        type="button"
        className="block text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => {
          setMode(mode === "create" ? "sign-in" : "create")
          setError(null)
        }}
      >
        {mode === "create" ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </form>
  )
}
