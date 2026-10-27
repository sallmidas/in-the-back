import { Link } from "react-router-dom"
import { REPORTER_REWARD_NOTE } from "../../shared/plan-copy.mjs"
import { ContactLine } from "@/components/layout/ContactLine"
import { DraftBanner } from "@/components/layout/DraftBanner"

export function TermsPage() {
  return (
    <article className="max-w-2xl space-y-4 text-sm leading-relaxed">
      <DraftBanner />
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Terms</p>
      <h1 className="font-heading text-4xl tracking-tight">Terms of Use</h1>
      <p className="text-muted-foreground">
        This is a plain-English draft for the free preview of In the Back. It is not a
        lawyer-reviewed contract. If you use the board, these are the rules we are running now.
      </p>
      <ContactLine />

      <h2 className="font-heading pt-2 text-2xl">The preview is free</h2>
      <p className="text-muted-foreground">
        In the Back does not take money and does not pay money during this preview. The Plans
        page shows a model that is planned for later: a facility would pay monthly for alerts.{" "}
        {REPORTER_REWARD_NOTE} Filing alone would not earn it. In that later model the reward would
        be $3 on Watch and $5 on Respond. That page is a preview, not an offer, not a promise, and
        not a date. Nothing on it is for sale.
      </p>

      <h2 className="font-heading pt-2 text-2xl">The board is about rooms</h2>
      <p className="text-muted-foreground">
        Filings are about a room: cleanliness, safety, and dignity. They are not about a person,
        a boss, a résumé, or a hiring decision. Do not name people. Do not post contact details,
        tips, wages, or a location pin. There is no bullying lane and no witness lane. The{" "}
        <Link to="/content" className="underline-offset-4 hover:underline">
          content policy
        </Link>{" "}
        is the longer version of this rule.
      </p>

      <h2 className="font-heading pt-2 text-2xl">“I was in this room”</h2>
      <p className="text-muted-foreground">
        Filing asks you to confirm you were in the room. That is your word. We do not check it
        against a roster, a badge, a camera, or a map. We do not store the answer. You are
        responsible for what you file.
      </p>

      <h2 className="font-heading pt-2 text-2xl">Retract and hide</h2>
      <p className="text-muted-foreground">
        You can retract your own filing with the receipt, or with the account you were signed in
        with. A workplace cannot delete a filing. The platform chair can hide a published filing
        that breaks the content rules, and can put it back. Hiding takes it off the public board.
        It is not the same as you retracting it.
      </p>

      <h2 className="font-heading pt-2 text-2xl">Accounts and the chair</h2>
      <p className="text-muted-foreground">
        An account is optional for filing. It is an email and a password. Don’t share the
        password. The platform chair is the first account that claims it. The claim does not
        reopen for a second account. The public board does not show who claimed it. Deleting an
        account does not delete filings. The chair account cannot be deleted.
      </p>

      <h2 className="font-heading pt-2 text-2xl">What the board is not</h2>
      <p className="text-muted-foreground">
        A filing is one person’s account of a room. It can be incomplete or wrong. The board is
        not a background check, not an inspection, and not advice. We don’t promise that the site
        will be up, complete, or error-free. Sample workplaces, if a demo is switched on, are
        labeled DEMO and are not live reviews.
      </p>

      <h2 className="font-heading pt-2 text-2xl">This draft</h2>
      <p className="text-muted-foreground">
        These terms can be replaced after legal review. The{" "}
        <Link to="/privacy" className="underline-offset-4 hover:underline">
          privacy draft
        </Link>{" "}
        describes what is stored. Until a lawyer-reviewed version replaces this page, this is the
        notice on the site.
      </p>
      <ContactLine />
    </article>
  )
}
