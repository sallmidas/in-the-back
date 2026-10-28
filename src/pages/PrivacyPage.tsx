import { Link } from "react-router-dom"
import { ContactLine } from "@/components/layout/ContactLine"
import { DraftBanner } from "@/components/layout/DraftBanner"
import { Button } from "@/components/ui/button"

export function PrivacyPage() {
  return (
    <article className="max-w-2xl space-y-4 text-sm leading-relaxed">
      <DraftBanner />
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Privacy</p>
      <h1 className="font-heading text-4xl tracking-tight">Privacy</h1>
      <p className="text-muted-foreground">
        This is a plain-English draft of what In the Back stores during the free preview. It is
        not a lawyer-reviewed policy. Read it with the{" "}
        <Link to="/terms" className="underline-offset-4 hover:underline">
          Terms of Use
        </Link>{" "}
        and the{" "}
        <Link to="/content" className="underline-offset-4 hover:underline">
          content policy
        </Link>
        . The two sections below are separate: one for people who read or file, and one for a
        store.
      </p>
      <ContactLine />

      <h2 className="font-heading pt-2 text-2xl">If you read or file</h2>
      <p className="text-muted-foreground">
        In the Back is a room-level board. People file reports about a room — cleanliness, safety,
        dignity — not about a named person. Reading and filing are free. We do not ask for a card,
        a bank account, or a location pin.
      </p>

      <h3 className="font-heading pt-2 text-xl">What the public sees</h3>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Workplace name, city, region, industry, and room list.</li>
        <li>Room scores and the writing on filings that are still on the board.</li>
        <li>Shift or station context written without a name.</li>
        <li>Official records we copied from a government agency: the agency's words, the date, the address, amounts, and a link to the source. People's names are left off.</li>
      </ul>

      <h3 className="font-heading pt-2 text-xl">What stays off the board</h3>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Your name, email, phone, badge, or account.</li>
        <li>The receipt for a filing. We store a hash of it, not the receipt itself.</li>
        <li>Who the moderator is.</li>
        <li>The “I was in this room” confirmation. It is required to file and then thrown away. We do not check it against a schedule, a badge, or a map.</li>
        <li>A filing the moderator has hidden, or one you have retracted.</li>
        <li>City and region are words you typed. We do not collect GPS.</li>
      </ul>

      <h3 className="font-heading pt-2 text-xl">Filing</h3>
      <p className="text-muted-foreground">
        You can file without an account. We store the workplace, the room, the score, the shift
        context, the writing, and the time. If you are signed in, we also store a private link
        from that filing to your account so you can retract it later. The public board does not
        show that link. The receipt works either way. Keep the receipt. We cannot show it to you
        again.
      </p>

      <h3 className="font-heading pt-2 text-xl">Your account and the session cookie</h3>
      <p className="text-muted-foreground">
        An account is an email and a password. We store a hash of the password, not the password.
        Signing in sets one session cookie that page script cannot read. It is used to recognize
        the browser. We do not use advertising cookies. Deleting an account removes the email,
        the password hash, and the sessions. It does not retract a filing. The moderator
        account cannot be deleted, so that role is not dropped by accident.
      </p>

      <h3 className="font-heading pt-2 text-xl">The moderator and hidden filings</h3>
      <p className="text-muted-foreground">
        The moderator reviews reports. We store who that is. We do not publish it. The moderator
        can hide a published filing, and put it back. A hidden filing
        leaves the public board and the room score. It stays in the private store until you
        retract it.
      </p>
      <h3 className="font-heading pt-2 text-xl">Public records</h3>
      <p className="text-muted-foreground">
        We also keep official records, such as a citation or an inspection, with an as-of date.
        Records older than five years are hidden. These are not worker reports. A note that a
        record looks wrong is stored for a moderator. We do not ask who sent the note.
      </p>

      <h2 className="font-heading pt-4 text-2xl">If you are a store</h2>
      <p className="text-muted-foreground">
        A store account is separate. To claim a store we store the business name, the role, and a
        work email, and we keep that claim pending until the moderator approves it. The
        public board does not show the claim. A verified store sees its rooms, scores, and the
        reports on those rooms. Reports are anonymous. We do not give a store the email, name, or
        account behind a report. A store cannot hide or delete a report. A report may be marked
        under review. That mark does not name who wrote it. A store sees the same public records
        as everyone else, and can report an error in one. Nothing is charged during this preview.
      </p>

      <h2 className="font-heading pt-2 text-2xl">Request addresses</h2>
      <p className="text-muted-foreground">
        The server may use the address of a connection, including an address passed by the host’s
        proxy, to slow repeated attempts. That address is not written onto the board and is not
        kept in the board file. We do not build a location profile from it.
      </p>

      <h2 className="font-heading pt-2 text-2xl">Sample data</h2>
      <p className="text-muted-foreground">
        A demo board of invented workplaces can be turned on for development. It is off unless
        someone explicitly enables it. Those workplaces are labeled DEMO and are not live reviews.
        The launch build does not include them.
      </p>

      <h2 className="font-heading pt-2 text-2xl">What we don’t do</h2>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>We don’t sell personal information.</li>
        <li>We don’t take tips or wages.</li>
        <li>We don’t ask you to prove employment, and we don’t offer a witness or bullying lane.</li>
      </ul>

      <p className="text-muted-foreground">
        This draft can be replaced after legal review. The board file is the record of accounts
        and filings until then.
      </p>
      <ContactLine />
      <Button asChild variant="outline">
        <Link to="/account/delete">Delete account</Link>
      </Button>
    </article>
  )
}
