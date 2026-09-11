import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function PrivacyPage() {
  return (
    <article className="prose-invert max-w-2xl space-y-4 text-sm leading-relaxed">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Placeholder</p>
      <h1 className="font-heading text-4xl tracking-tight">Privacy</h1>
      <p className="text-muted-foreground">
        Phase 1 copy. Not a lawyer-reviewed policy. The product rule is simpler than a résumé
        site: the public board never carries reviewer identity.
      </p>
      <h2 className="font-heading pt-2 text-2xl">What the public sees</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Workplace name, city, industry, and room list.</li>
        <li>Room scores and anonymous excerpts.</li>
        <li>Shift/station context written without a name.</li>
        <li>A dispute badge when a kitchen has flagged a report.</li>
      </ul>
      <h2 className="font-heading pt-2 text-2xl">What stays off the board</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Reviewer name, email, phone, badge, or login.</li>
        <li>Platform chair identity, even after they claim a queue.</li>
        <li>Location is a workplace listing, not a pin drop.</li>
      </ul>
      <h2 className="font-heading pt-2 text-2xl">Accounts</h2>
      <p className="text-muted-foreground">
        Staff sign-in in this build is a local stub. Delete-account is a placeholder until a
        real identity provider exists. Form an LLC before you collect production PII or take
        payments.
      </p>
      <Button asChild variant="outline">
        <Link to="/account/delete">Delete account placeholder</Link>
      </Button>
    </article>
  )
}
