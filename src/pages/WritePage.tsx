import { type FormEvent, useEffect, useRef, useState } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { AuthForm } from "@/components/account/AuthForm"
import { BoardSkeleton } from "@/components/layout/BoardSkeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { filingNameError } from "../../shared/names.mjs"
import {
  INDUSTRIES,
  INDUSTRY_LABELS,
  ROOM_KINDS,
  ROOM_LABELS,
  isIndustry,
  isRoomKind,
} from "@/data/types"
import {
  fileReport,
  myReports,
  retractOwnReport,
  retractWithReceipt,
  type OwnedReport,
} from "@/lib/api"
import { useBoard } from "@/lib/board"
import { useSession } from "@/lib/session"

const UNSET = "unset"
const RECEIPT_KEY = "itb.lastReceipt"

function sameReceipt(left: string, right: string) {
  const norm = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const a = norm(left)
  return a.length > 0 && a === norm(right)
}

function savedReceipt(): { receipt: string; slug: string | null } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) ?? "null") as {
      receipt?: string
      slug?: string
    } | null
    if (!saved?.receipt) return null
    return { receipt: saved.receipt, slug: saved.slug ?? null }
  } catch {
    sessionStorage.removeItem(RECEIPT_KEY)
    return null
  }
}

export function WritePage() {
  const { ready, workplaces, refresh } = useBoard()
  const { user, ready: sessionReady } = useSession()
  const [params] = useSearchParams()
  const presetSlug = params.get("workplace") ?? ""
  const presetRoom = params.get("room") ?? ""

  const [creating, setCreating] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [workplaceSlug, setWorkplaceSlugState] = useState(UNSET)
  const [workplaceName, setWorkplaceName] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [industry, setIndustry] = useState(UNSET)
  const [roomTouched, setRoomTouched] = useState(false)
  const [roomState, setRoomState] = useState(UNSET)
  const presetMatch = ready && presetSlug !== "" && workplaces.some((workplace) => workplace.slug === presetSlug)
  const resolvedSlug = slugTouched ? workplaceSlug : presetMatch ? presetSlug : UNSET
  const room = roomTouched ? roomState : isRoomKind(presetRoom) ? presetRoom : UNSET

  function setWorkplaceSlug(value: string) {
    setSlugTouched(true)
    setWorkplaceSlugState(value)
  }

  function setRoom(value: string) {
    setRoomTouched(true)
    setRoomState(value)
  }
  const [score, setScore] = useState("")
  const [shoutOut, setShoutOut] = useState(false)
  const [context, setContext] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [inRoom, setInRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<string | null>(() => savedReceipt()?.receipt ?? null)
  const [filedSlug, setFiledSlug] = useState<string | null>(() => savedReceipt()?.slug ?? null)
  const [pending, setPending] = useState(false)
  const [retractCode, setRetractCode] = useState("")
  const [retractNotice, setRetractNotice] = useState<string | null>(null)
  const [retractError, setRetractError] = useState<string | null>(null)
  const [mine, setMine] = useState<OwnedReport[] | null>(null)
  const [copied, setCopied] = useState(false)
  const fileLock = useRef(false)
  const retractLock = useRef(false)

  const listed = workplaces.length > 0 && !creating

  useEffect(() => {
    if (!sessionReady || !user || user.kind === "store") return
    let cancel = false
    myReports()
      .then((result) => {
        if (!cancel) setMine(result.reports)
      })
      .catch(() => {
        if (!cancel) setMine(null)
      })
    return () => {
      cancel = true
    }
  }, [sessionReady, user])

  async function loadMine() {
    if (!user) {
      setMine(null)
      return
    }
    try {
      const result = await myReports()
      setMine(result.reports)
    } catch {
      setMine(null)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const scoreValue = Number.parseFloat(score)
    const selected = workplaces.find((workplace) => workplace.slug === resolvedSlug)
    const name = listed ? selected?.name ?? "" : workplaceName.trim()

    if (!name) {
      setError(listed ? "Pick a workplace, or file one that is not listed yet." : "Name the workplace.")
      return
    }
    if (!isRoomKind(room)) {
      setError("Pick a room.")
      return
    }
    if (!Number.isFinite(scoreValue) || scoreValue < 1 || scoreValue > 10) {
      setError("Score cleanliness, safety, and dignity from 1 to 10.")
      return
    }
    if (!context.trim() || !excerpt.trim()) {
      setError("Shift context and writing are required. Never a name.")
      return
    }
    if (!listed && !isIndustry(industry)) {
      setError("Pick an industry.")
      return
    }
    if (!listed && (!city.trim() || !region.trim())) {
      setError("Name the city and region. This is text you type, not a location pin.")
      return
    }
    if (!inRoom) {
      setError("Confirm you were in this room. We do not check a badge or a schedule.")
      return
    }

    const nameError = filingNameError({
      workplaceName: name,
      city: listed ? "" : city,
      region: listed ? "" : region,
      context,
      excerpt,
    })
    if (nameError) {
      setError(nameError)
      return
    }

    if (fileLock.current) return
    fileLock.current = true
    setPending(true)
    setError(null)
    try {
      const result = await fileReport({
        create: !listed,
        workplaceName: name,
        workplaceSlug: listed ? resolvedSlug : undefined,
        city: listed ? undefined : city.trim(),
        region: listed ? undefined : region.trim(),
        industry: listed ? undefined : industry,
        roomKind: room,
        score: scoreValue,
        context: context.trim(),
        excerpt: excerpt.trim(),
        inRoom: true,
        kind: shoutOut ? "shout-out" : "report",
      })
      setReceipt(result.receipt)
      setFiledSlug(result.report.workplaceSlug)
      setCopied(false)
      sessionStorage.setItem(
        RECEIPT_KEY,
        JSON.stringify({ receipt: result.receipt, slug: result.report.workplaceSlug }),
      )
      setWorkplaceSlug(UNSET)
      setWorkplaceName("")
      setCity("")
      setRegion("")
      setIndustry(UNSET)
      setRoom(UNSET)
      setScore("")
      setContext("")
      setExcerpt("")
      setInRoom(false)
      setCreating(false)
      await refresh()
      await loadMine()
    } catch (err) {
      setError(err instanceof Error ? err.message : "The filing did not save.")
    } finally {
      fileLock.current = false
      setPending(false)
    }
  }

  async function onRetract(event: FormEvent) {
    event.preventDefault()
    if (retractLock.current) return
    retractLock.current = true
    setRetractError(null)
    setRetractNotice(null)
    try {
      await retractWithReceipt(retractCode)
      setRetractCode("")
      setRetractNotice("Retracted. The file is off the public board.")
      if (sameReceipt(retractCode, receipt ?? "")) {
        sessionStorage.removeItem(RECEIPT_KEY)
        setReceipt(null)
      }
      await refresh()
    } catch (err) {
      setRetractError(err instanceof Error ? err.message : "That receipt did not retract a file.")
    } finally {
      retractLock.current = false
    }
  }

  async function onRetractOwn(reportId: string) {
    setRetractError(null)
    setRetractNotice(null)
    try {
      await retractOwnReport(reportId)
      setRetractNotice("Retracted. The file is off the public board.")
      await refresh()
      await loadMine()
    } catch (err) {
      setRetractError(err instanceof Error ? err.message : "That file was not retracted.")
    }
  }

  if (!sessionReady || !ready) return <BoardSkeleton />
  if (user?.kind === "store") return <Navigate to="/stores/dashboard" replace />

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          File a report
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Score a room</h1>
        <p className="text-muted-foreground">
          Filing is open to anyone. Name the workplace and the room, score it, and write about the
          shift. No names. Reading and filing are free.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {receipt ? (
        <div role="status" className="space-y-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">
          <p>Filed. It is on the board. Copy this receipt now. It is not published, and we cannot show it again later. It stays on this page if you refresh this tab.</p>
          <p className="font-mono text-base tracking-wide break-all">{receipt}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(receipt).then(
                () => setCopied(true),
                () => setCopied(false),
              )
            }}
          >
            {copied ? "Copied" : "Copy receipt"}
          </Button>
          <p className="text-muted-foreground">
            Use the receipt, or the account you were signed in with, to retract your own file. A
            moderator can hide writing that breaks the content rules.
          </p>
          {filedSlug ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/workplaces/${filedSlug}`}>See it on the board</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-card/70 p-5">
        {user ? (
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-mono">{user.email}</span>. This file will be tied to
            your account. The receipt still works if you sign out.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              An account is optional. Sign in only if you want to retract later without the receipt.
            </p>
            <AuthForm />
          </div>
        )}
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border bg-card/70 p-5"
      >
        {listed ? (
          <div className="space-y-1.5">
            <Label htmlFor="write-workplace">Workplace</Label>
            <Select value={resolvedSlug} onValueChange={setWorkplaceSlug}>
              <SelectTrigger id="write-workplace" className="w-full">
                <SelectValue placeholder="Choose a workplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Choose a workplace</SelectItem>
                {workplaces.map((workplace) => (
                  <SelectItem key={workplace.slug} value={workplace.slug}>
                    {workplace.name}
                    {workplace.demo ? " · DEMO" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setCreating(true)}
            >
              The workplace is not listed yet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workplaces.length > 0 ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setCreating(false)}
              >
                Pick a workplace already on the board
              </button>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="write-workplace">Workplace</Label>
              <Input
                id="write-workplace"
                value={workplaceName}
                onChange={(event) => setWorkplaceName(event.target.value)}
                placeholder="The building, not a person"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="write-city">City</Label>
                <Input
                  id="write-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City you type"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="write-region">Region</Label>
                <Input
                  id="write-region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="State or region"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="write-industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="write-industry" className="w-full">
                  <SelectValue placeholder="What kind of building" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>What kind of building</SelectItem>
                  {INDUSTRIES.map((id) => (
                    <SelectItem key={id} value={id}>
                      {INDUSTRY_LABELS[id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="write-room">Room</Label>
          <Select value={room} onValueChange={setRoom}>
            <SelectTrigger id="write-room" className="w-full">
              <SelectValue placeholder="Walk-in, dish pit, dock…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>Choose a room</SelectItem>
              {ROOM_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {ROOM_LABELS[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-score">Score, 1 to 10</Label>
          <Input
            id="write-score"
            inputMode="decimal"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="1 is rough, 10 is solid"
            aria-describedby="write-score-help"
          />
          <p id="write-score-help" className="text-xs text-muted-foreground">
            1 is a rough room. 10 is a solid one. Score cleanliness, safety, and dignity together.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-context">Shift context</Label>
          <Input
            id="write-context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Tuesday close · prep — no identity"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="write-excerpt">Writing</Label>
          <Textarea
            id="write-excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="What you saw in the room. Never a name."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Names are blocked, including a capitalized first name or initials. Lowercase names and
            names the check does not know can still get through. Write about the room, not a person.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-3">
          <input
            id="write-in-room"
            type="checkbox"
            checked={inRoom}
            onChange={(event) => setInRoom(event.target.checked)}
            className="mt-1 size-6 accent-primary"
          />
          <div className="space-y-1">
            <Label htmlFor="write-in-room">I was in this room.</Label>
            <p className="text-xs text-muted-foreground">
              We do not check a badge or a schedule. Check this only if you were in the room.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="write-shout-out"
            type="checkbox"
            checked={shoutOut}
            onChange={(event) => setShoutOut(event.target.checked)}
            className="mt-1 size-6 accent-primary"
          />
          <div className="space-y-1">
            <Label htmlFor="write-shout-out">This is a shout-out.</Label>
            <p className="text-xs text-muted-foreground">
              A shout-out praises the room. It still cannot name a person, and it follows the same rules as any other filing.
            </p>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? "Filing…" : "File report"}
        </Button>
        <p className="text-xs text-muted-foreground">
          You can retract your own file. A moderator can hide one that breaks the content policy.
        </p>
      </form>

      <section className="space-y-3 rounded-xl border border-border bg-card/70 p-5">
        <h2 className="font-heading text-2xl tracking-tight">Retract your file</h2>
        <p className="text-sm text-muted-foreground">
          Paste the receipt, or retract a file tied to this account. A moderator can hide a filing
          under the content policy. The public still never sees who wrote it.
        </p>
        {retractError ? (
          <p role="alert" className="text-sm text-destructive">
            {retractError}
          </p>
        ) : null}
        {retractNotice ? (
          <p role="status" className="text-sm">
            {retractNotice}
          </p>
        ) : null}
        <form onSubmit={onRetract} className="flex flex-col gap-2 sm:flex-row">
          <Label htmlFor="receipt" className="sr-only">
            Receipt
          </Label>
          <Input
            id="receipt"
            value={retractCode}
            onChange={(event) => setRetractCode(event.target.value)}
            placeholder="Receipt"
            autoComplete="off"
          />
          <Button type="submit" variant="outline" className="min-h-11 sm:w-auto">
            Retract
          </Button>
        </form>
        {user ? (
          <OwnFiles
            reports={mine}
            onLoad={() => void loadMine()}
            onRetract={(id) => void onRetractOwn(id)}
          />
        ) : null}
      </section>

      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link to="/">Back to the board</Link>
      </Button>
    </div>
  )
}

function OwnFiles({
  reports,
  onLoad,
  onRetract,
}: {
  reports: OwnedReport[] | null
  onLoad: () => void
  onRetract: (id: string) => void
}) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Files on this account</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onLoad}>
          {reports ? "Refresh" : "Show"}
        </Button>
      </div>
      {reports?.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : null}
      {reports?.map((report) => (
        <div key={report.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {report.workplaceName} · {isRoomKind(report.roomKind) ? ROOM_LABELS[report.roomKind] : report.roomKind}
            {report.retracted ? " · retracted" : report.hidden ? " · hidden from the board" : ""}
          </p>
          {report.retracted ? null : (
            <Button type="button" variant="outline" size="sm" onClick={() => onRetract(report.id)}>
              Retract
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
