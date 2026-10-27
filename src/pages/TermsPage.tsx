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
        lawyer-reviewed contract. If you use the site, these are the rules we are running now.
        The two sections below are separate.
      </p>
      <ContactLine />

      <h2 className="font-heading pt-2 text-2xl">If you read or file</h2>
      <p className="text-muted-foreground">
        Reading and filing are free. In the Back does not take money from you and does not pay
        you during this preview. {REPORTER_REWARD_NOTE} Filing alone would not earn it. In that
        later model the reward would be $3 on Watch and $5 on Respond, as part of a store’s
        monthly price. That is a preview of a later model, not an offer, not a promise, and not
        a date.
      </p>
      <p className="text-muted-foreground">
        Filings are about a room: cleanliness, safety, and dignity. They are not about a person,
        a boss, a résumé, or a hiring decision. Do not name people. Do not post contact details,
        tips, wages, or a location pin. There is no bullying lane and no witness lane. The{" "}
        <Link to="/content" className="underline-offset-4 hover:underline">
          content policy
        </Link>{" "}
        is the longer version of this rule.
      </p>
      <p className="text-muted-foreground">
        Filing asks you to confirm you were in the room. That is your word. We do not check it
        against a roster, a badge, a camera, or a map. We do not store the answer. You are
        responsible for what you file.
      </p>
      <p className="text-muted-foreground">
        You can retract your own filing with the receipt, or with the account you were signed in
        with. The moderator can hide a published filing that breaks the content rules, and
        can put it back. Hiding takes it off the public board. It is not the same as you
        retracting it.
      </p>
      <p className="text-muted-foreground">
        An account is optional for filing. It is an email and a password. Don’t share the
        password. The moderator reviews reports. The public board does not show who that is.
        Deleting an account does not delete filings. The moderator account cannot be deleted.
      </p>
      <p className="text-muted-foreground">
        A filing is one person’s account of a room. It can be incomplete or wrong. The board is
        not a background check, not an inspection, and not advice. We don’t promise that the site
        will be up, complete, or error-free. Sample workplaces, if a demo is switched on, are
        labeled DEMO and are not live reviews.
      </p>

      <h2 className="font-heading pt-4 text-2xl">If you are a store</h2>
      <p className="text-muted-foreground">
        Store plans describe a later model: a store would pay monthly for alerts, and a higher
        plan would add a response or dispute and a faster way to recover a rating. Nothing on
        that page is for sale during this preview, and nothing is charged now. Notes on the board
        are anonymous.
      </p>
      <p className="text-muted-foreground">
        A store account is not the moderator. A store claim stays pending until the moderator
        approves it. One verified claim per store, unless the moderator adds another. A store cannot
        delete, hide, or edit a report.
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
