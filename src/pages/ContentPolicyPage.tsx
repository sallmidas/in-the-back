import { Link } from "react-router-dom"
import { ContactLine } from "@/components/layout/ContactLine"

export function ContentPolicyPage() {
  return (
    <article className="max-w-2xl space-y-4 text-sm leading-relaxed">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Moderation</p>
      <h1 className="font-heading text-4xl tracking-tight">Content policy</h1>
      <p className="text-muted-foreground">
        These are the rules for what belongs on the board. The platform chair uses them when
        hiding or unhiding a filing. They match the{" "}
        <Link to="/terms" className="underline-offset-4 hover:underline">
          terms
        </Link>{" "}
        and the{" "}
        <Link to="/privacy" className="underline-offset-4 hover:underline">
          privacy draft
        </Link>
        .
      </p>
      <ContactLine />

      <h2 className="font-heading pt-2 text-2xl">What a filing is for</h2>
      <p className="text-muted-foreground">
        Write about a room. Cleanliness, safety, and dignity in a kitchen, dish pit, walk-in,
        staff bathroom, break room, dock, stock room, or overnight area. Score the space and the
        shift. The public sees the room, the score, the context, and the writing.
      </p>

      <h2 className="font-heading pt-2 text-2xl">What to leave out</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Names of people, initials that point at a person, and “my name is”.</li>
        <li>Phone numbers, emails, badge numbers, and other contact details.</li>
        <li>Writing about a person instead of the room. No boss rankings, no résumés, no hiring posts.</li>
        <li>Bullying, a witness lane, threats, or a pile-on.</li>
        <li>Tips, wages, or anything asking for money.</li>
        <li>GPS, a map pin, or a precise home address. City and region are typed words.</li>
        <li>An employment wall. You do not prove you work there. The only check is your own confirmation that you were in the room, and that confirmation is not verified.</li>
      </ul>

      <h2 className="font-heading pt-2 text-2xl">Names</h2>
      <p className="text-muted-foreground">
        The filing form and the server refuse text that looks like a person’s name. The check
        misses names it does not know, and it misses all-lowercase names. Write about the room
        anyway. A filing that names a person can be hidden even if the check let it through.
      </p>

      <h2 className="font-heading pt-2 text-2xl">Hide, unhide, retract</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>A filing goes on the public board when it is sent.</li>
        <li>The person who filed it can retract it with the receipt or with their account. Retracting takes it off the board.</li>
        <li>The platform chair can hide a published filing that breaks these rules, and can put it back. Hiding takes it off the public board and out of the room score. The workplace can remain listed. The filing stays in the private store.</li>
        <li>A workplace cannot delete a filing. There is no Resolve button.</li>
      </ul>

      <h2 className="font-heading pt-2 text-2xl">Asking for a review</h2>
      <p className="text-muted-foreground">
        If a filing on the board breaks these rules, write to the contact below and name the
        workplace and the room. Do not include a person’s name in that note if you can point at
        the filing without one.
      </p>
      <ContactLine />
    </article>
  )
}
