import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function PrivacyPage() {
  return (
    <article className="prose-invert max-w-2xl space-y-4 text-sm leading-relaxed">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Privacy</p>
      <h1 className="font-heading text-4xl tracking-tight">Privacy</h1>
      <p className="text-muted-foreground">
        Not a lawyer-reviewed policy. The public board never carries reviewer identity.
      </p>
      <h2 className="font-heading pt-2 text-2xl">What the public sees</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Workplace name, city, industry, and room list.</li>
        <li>Room scores and anonymous excerpts.</li>
        <li>Shift or station context written without a name.</li>
        <li>A dispute badge when a kitchen has flagged a report.</li>
      </ul>
      <h2 className="font-heading pt-2 text-2xl">What stays off the board</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Reviewer name, email, phone, badge, or login.</li>
        <li>The receipt code for a filing.</li>
        <li>Who claimed the platform chair.</li>
        <li>City and region are words the filer typed, not a location pin.</li>
      </ul>
      <h2 className="font-heading pt-2 text-2xl">Accounts</h2>
      <p className="text-muted-foreground">
        An account is an email and a password. The password is stored as a hash. A session cookie
        stays in the browser and is not readable by the page script. Filing does not require an
        account. If you file while signed in, that account can retract the file. A receipt can
        retract it either way. Deleting an account does not delete a published file.
      </p>
      <Button asChild variant="outline">
        <Link to="/account/delete">Delete account</Link>
      </Button>
    </article>
  )
}
