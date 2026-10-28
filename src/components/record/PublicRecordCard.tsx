import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { reportRecordError, type PublicRecord } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import { cn, focusRingClass } from "@/lib/utils"

const STATUS_LABELS: Record<PublicRecord["status"], string> = {
  open: "Open",
  closed: "Closed",
  contested: "Contested",
  settled: "Settled",
  abated: "Abated",
  reinspected: "Re-inspected",
}

function formatRecordDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function PublicRecordCard({
  record,
  showPlace = false,
}: {
  record: PublicRecord
  showPlace?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const good = record.outcome === "clear" || record.outcome === "recognition"
  const headline =
    record.outcome === "clear"
      ? record.sourceAgency === "whd"
        ? "No violations found"
        : "Passed inspection"
      : record.outcome === "recognition"
        ? record.awardLabel || "Recognition"
        : "Public record"
  const placeLine = [record.street, record.city, record.region, record.zip].filter(Boolean).join(", ")

  async function onReport(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await reportRecordError(record.id, note)
      setSent(true)
      setNote("")
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "That note was not sent.")
    } finally {
      setPending(false)
    }
  }

  return (
    <article
      className={cn(
        "space-y-3 rounded-xl border border-border bg-card/80 p-4 sm:p-5",
        good ? "border-l-4 border-l-emerald-400" : "",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={good ? "secondary" : "outline"}>{headline}</Badge>
        <Badge variant="secondary">{record.agencyLabel}</Badge>
        {good ? null : (
          <Badge variant="outline">{STATUS_LABELS[record.status] ?? record.status}</Badge>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-xl tracking-tight">
          {showPlace && record.workplaceSlug ? (
            <Link
              to={`/workplaces/${record.workplaceSlug}`}
              className={cn("rounded-sm hover:text-primary", focusRingClass)}
            >
              {record.businessName}
            </Link>
          ) : (
            record.businessName
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatRecordDate(record.recordDate)}
          {placeLine ? ` · ${placeLine}` : ""}
        </p>
        <p className="font-mono text-xs text-muted-foreground">Record {record.recordId}</p>
      </div>
      {record.items && record.items.length > 0 ? (
        <ul className="space-y-2 text-sm leading-relaxed">
          {record.items.map((item, index) => (
            <li key={`${item.standard}-${index}`}>
              <span>
                {item.label}: {item.detail}
              </span>
              {item.standard ? (
                <span className="block text-xs text-muted-foreground">{item.standard}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : record.summary ? (
        <p className="text-sm leading-relaxed">{record.summary}</p>
      ) : null}
      {record.itemTotal ? <p className="text-sm text-muted-foreground">{record.itemTotal}</p> : null}
      {record.reply ? <p className="text-sm">Owner reply: {record.reply}</p> : null}
      {!record.itemTotal && record.outcome === "finding" && (record.backWages !== null || record.penalty !== null) ? (
        <p className="text-sm text-muted-foreground">
          {record.backWages !== null ? `Back wages ${formatMoney(record.backWages)}` : ""}
          {record.backWages !== null && record.penalty !== null ? " · " : ""}
          {record.penalty !== null ? `Penalty ${formatMoney(record.penalty)}` : ""}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {record.credit}. This is a credit. It is not an endorsement. As of {formatRecordDate(record.fetchedAt)}.
        {record.sourceUrl ? (
          <>
            {" "}
            <a
              href={record.sourceUrl}
              className={cn("underline-offset-4 hover:underline", focusRingClass)}
              rel="noreferrer"
              target="_blank"
            >
              Source
            </a>
          </>
        ) : null}
      </p>
      {sent ? <p className="text-sm">Sent to a moderator.</p> : null}
      {open ? (
        <form onSubmit={onReport} className="space-y-2">
          <Label htmlFor={`record-error-${record.id}`}>What looks wrong</Label>
          <Textarea
            id={`record-error-${record.id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
            maxLength={500}
            placeholder="The address, the business, or the status."
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Sending…" : "Report an error"}
          </Button>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Report an error
        </Button>
      )}
    </article>
  )
}

export function PublicRecordFootnote() {
  return (
    <p className="text-xs text-muted-foreground">
      From official government records. Not a worker report. Spotted an error? Report it.
    </p>
  )
}
