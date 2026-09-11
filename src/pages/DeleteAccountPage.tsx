import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signOutStaff } from "@/lib/staff-session"

export function DeleteAccountPage() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    signOutStaff()
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-lg space-y-3">
        <h1 className="font-heading text-4xl tracking-tight">Request recorded (stub)</h1>
        <p className="text-muted-foreground">
          This build cleared the local platform-chair session only. There is no production account store
          to delete. When identity exists, this page will queue a deletion and confirm by email.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Placeholder</p>
      <h1 className="font-heading text-4xl tracking-tight">Delete account</h1>
      <p className="text-muted-foreground">
        There are no live accounts yet. Submitting this form signs out the queue stub in this
        browser so you can demo the empty state.
      </p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card/70 p-5">
        <Label htmlFor="delete-email">Email on the stub session</Label>
        <Input
          id="delete-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="chair@example.com"
        />
        <Button type="submit" variant="destructive">
          Request deletion
        </Button>
      </form>
    </div>
  )
}
