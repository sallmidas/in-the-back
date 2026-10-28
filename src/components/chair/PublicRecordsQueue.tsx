import { useEffect, useState } from "react"
import {
  chairOwnerAwards,
  chairPublicRecords,
  chairRecordErrors,
  chairRecordReplies,
  closeRecordError,
  decideOwnerAward,
  decideRecordReply,
  linkPublicRecord,
  placePublicRecord,
  type PublicRecord,
  type RecordErrorItem,
} from "@/lib/api"
import { Button } from "@/components/ui/button"

export function PublicRecordsQueue({ active }: { active: boolean }) {
  const [records, setRecords] = useState<PublicRecord[] | null>(null)
  const [workplaces, setWorkplaces] = useState<{ id: string; name: string; city: string; street: string }[]>([])
  const [errors, setErrors] = useState<RecordErrorItem[] | null>(null)
  const [awards, setAwards] = useState<{ id: string; title: string; year: string; proofUrl?: string }[] | null>(null)
  const [replies, setReplies] = useState<{ id: string; text: string }[] | null>(null)
  const [choice, setChoice] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    let cancel = false
    Promise.all([chairPublicRecords(), chairRecordErrors(), chairOwnerAwards(), chairRecordReplies()])
      .then(([queue, notes, awardQueue, replyQueue]) => {
        if (cancel) return
        setRecords(queue.records)
        setWorkplaces(queue.workplaces)
        setErrors(notes.errors)
        setAwards(awardQueue.awards)
        setReplies(replyQueue.replies)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancel) return
        setError(err instanceof Error ? err.message : "The record queue didn't open.")
      })
    return () => {
      cancel = true
    }
  }, [active])

  async function refresh() {
    const [queue, notes, awardQueue, replyQueue] = await Promise.all([
      chairPublicRecords(),
      chairRecordErrors(),
      chairOwnerAwards(),
      chairRecordReplies(),
    ])
    setRecords(queue.records)
    setWorkplaces(queue.workplaces)
    setErrors(notes.errors)
    setAwards(awardQueue.awards)
    setReplies(replyQueue.replies)
  }

  async function onPlace(record: PublicRecord) {
    setMessage(null)
    setError(null)
    try {
      await placePublicRecord(record.id)
      setMessage(`Placed ${record.businessName}.`)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "That record was not placed.")
    }
  }

  async function onLink(record: PublicRecord) {
    const workplaceId = choice[record.id]
    if (!workplaceId) return
    setMessage(null)
    setError(null)
    try {
      await linkPublicRecord(record.id, workplaceId)
      setMessage(`Linked ${record.businessName}.`)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "That record was not linked.")
    }
  }

  async function onClose(item: RecordErrorItem) {
    setError(null)
    try {
      await closeRecordError(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "That note was not closed.")
    }
  }

  if (!active) return null

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-2xl">Public records</h2>
        <p className="text-sm text-muted-foreground">
          Unmatched records stay here until you link them to a place. Matching uses the street and the city.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm">{message}</p> : null}
      {records === null ? (
        <p className="text-sm text-muted-foreground">Opening records…</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No unmatched records.</p>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => (
            <article key={record.id} className="space-y-2 rounded-xl border border-border bg-card/70 p-4">
              <p className="text-sm">
                <span className="font-heading">{record.businessName}</span>
                <span className="block text-muted-foreground">
                  {record.agencyLabel} · {record.recordId} · {[record.street, record.city].filter(Boolean).join(", ")}
                </span>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => void onPlace(record)}>
                  Show on a place page
                </Button>
                <label className="sr-only" htmlFor={`link-${record.id}`}>
                  Existing place
                </label>
                <select
                  id={`link-${record.id}`}
                  className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-sm"
                  value={choice[record.id] ?? ""}
                  onChange={(event) => setChoice((current) => ({ ...current, [record.id]: event.target.value }))}
                >
                  <option value="">Link to an existing place</option>
                  {workplaces.map((workplace) => (
                    <option key={workplace.id} value={workplace.id}>
                      {workplace.name}
                      {workplace.city ? ` · ${workplace.city}` : ""}
                      {workplace.street ? ` · ${workplace.street}` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={!choice[record.id]}
                  onClick={() => void onLink(record)}
                >
                  Link
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="space-y-2 pt-2">
        <h3 className="font-heading text-xl">Owner awards</h3>
        {(awards ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No awards waiting.</p>
        ) : (
          awards?.map((award) => (
            <div key={award.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">{award.title}, {award.year}</p>
              <Button type="button" size="sm" onClick={() => void decideOwnerAward(award.id, true).then(() => refresh())}>
                Approve award
              </Button>
            </div>
          ))
        )}
        <h3 className="font-heading text-xl">Record replies</h3>
        {(replies ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No replies waiting.</p>
        ) : (
          replies?.map((reply) => (
            <div key={reply.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">{reply.text}</p>
              <Button type="button" size="sm" onClick={() => void decideRecordReply(reply.id, true).then(() => refresh())}>
                Approve reply
              </Button>
            </div>
          ))
        )}
        <h3 className="font-heading text-xl">Record errors</h3>
        {errors === null ? (
          <p className="text-sm text-muted-foreground">Opening notes…</p>
        ) : errors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open notes.</p>
        ) : (
          <div className="grid gap-2">
            {errors.map((item) => (
              <article key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">
                  {item.note}
                  <span className="block text-xs text-muted-foreground">
                    {item.record ? `${item.record.businessName} · ${item.record.recordId}` : "Record unavailable"}
                  </span>
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void onClose(item)}>
                  Close note
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
