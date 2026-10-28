/**
 * Heuristic block for personal names in filing text.
 *
 * Catches explicit phrases, titles, role-plus-name, emails, initials, a
 * capitalized first name from a common list, and that name plus a surname.
 *
 * Still misses all-lowercase names, names outside the list, and a few ordinary
 * words that are also names (Mark, Grace, Long) so a room sentence can start
 * with them. Can mistake a phrase that looks like First Last.
 * It blocks the filing. It does not rewrite the writing.
 */

const FIRST_NAMES = new Set(
  `james mary john robert patricia jennifer michael linda elizabeth david
barbara richard susan joseph jessica thomas sarah charles karen christopher
nancy daniel lisa matthew betty anthony margaret donald sandra mark dorothy
paul ashley joshua kimberly kenneth emily kevin donna brian michelle george
carol edward amanda ronald melissa timothy deborah jason stephanie jeffrey
rebecca ryan laura jacob sharon gary cynthia nicholas kathleen eric amy
jonathan angela stephen shirley larry anna justin brenda scott pamela brandon
emma benjamin nicole samuel samantha raymond katherine gregory christine
alexander debra frank rachel patrick carolyn jack maria dennis janet jerry
catherine tyler heather aaron diane jose julie henry joyce adam victoria
nathan olivia douglas kelly peter lauren zachary andrea nathaniel cheryl
noah dylan hannah andrew russell kayla juan gloria madison teresa
jose juan carlos luis miguel diego antonio jorge pedro rosa carmen sofia
lucia elena ana priya omar hassan fatima aisha wei minh linh javier
alejandro fernando ricardo andres sergio ramon raul marco mario valeria
daniela fernanda alejandra guadalupe ximena renata isabel camila
chris sam alex nick ben dan tim tom ken ron joe bob jim tony mike dave
steve bill rick matt andy chad kyle sean ian evan liam mason lucas logan
ava mia amelia harper evelyn abigail ella scarlett grace chloe lily natalie
zoey leah audrey claire madison aubrey savannah allison gabriella ariana
layla penelope riley nora stella violet aurora luna nova ivy ellie piper
ruby kylie peyton serena sophie sophia isabella
duc hung trang ngoc thanh phuong thuy lan mai hoa anh quang tuan dat khoa
nam long huy khanh vy chi thu huong hien thao
bo al ed ty`.split(/\s+/),
)

const SECOND_STOP = new Set(
  `period room shift close open night morning kitchen line pit dock stock
board house back floor walk door time today monday tuesday wednesday
thursday friday saturday sunday prep service station cooler freezer oven
grill bar inn cafe diner market hospital hotel court street avenue road
down up off out over under here there ready done late short slow left
right both only just with from into onto this that they them were was
been have had has will call church error code temp temps side pass window
garden hill park bay lake wood woods field point view end front the and
for but not all any our day tonight on`.split(/\s+/),
)

/** Capitalized words that are also ordinary English. A solo hit would block room writing. */
const SOLO_SKIP = new Set(
  `mark bill grace rose lily ruby ivy nova aurora stella violet luna ella piper
long hope joy faith dawn may will art pat don guy chase hunter summer angel
star sky amber crystal christian jordan harmony melody brook`.split(/\s+/),
)

export const NAME_BLOCK_MESSAGE =
  "Leave names out of the filing. Describe the room and the building, not a person."

function wordKey(token) {
  return token.toLowerCase().replace(/[^a-z]/g, "")
}

export function personalNameHit(text, options = {}) {
  if (!text || typeof text !== "string") return null
  const solo = options.solo !== false
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) return "email"

  if (
    /\b(?:[Mm]r|[Mm]rs|[Mm]s|[Mm]x|[Dd]r|[Pp]rof)\.?\s+([A-Z][a-z]+)\b/.test(text) &&
    titleHit(text)
  ) {
    return "title"
  }
  if (roleHit(text)) return "role"
  if (phraseHit(text)) return "phrase"
  if (initialHit(text)) return "initial"
  if (pairHit(text)) return "pair"
  if (capsHit(text)) return "caps"
  if (solo && soloHit(text)) return "solo"
  return null
}

function titleHit(text) {
  const re = /\b(?:[Mm]r|[Mm]rs|[Mm]s|[Mm]x|[Dd]r|[Pp]rof)\.?\s+([A-Z][a-z]+)\b/g
  for (const match of text.matchAll(re)) {
    if (!SECOND_STOP.has(match[1].toLowerCase())) return true
  }
  return false
}

function roleHit(text) {
  const re =
    /\b(?:[Cc]hef|[Mm]anager|[Ss]upervisor|[Oo]wner|[Ss]erver|[Cc]ook|[Bb]artender|[Hh]ost|[Ss]ous|[Bb]oss|[Gg][Mm])\s+([A-Z][a-z]+)\b/g
  for (const match of text.matchAll(re)) {
    if (!SECOND_STOP.has(match[1].toLowerCase())) return true
  }
  return false
}

function phraseHit(text) {
  const re =
    /\b(?:my name is|i am|i'm|i’m|named|called|aka|a\.k\.a\.)\s+([A-Za-z][A-Za-z'’-]+)/gi
  for (const match of text.matchAll(re)) {
    const word = match[1]
    const key = wordKey(word)
    if (FIRST_NAMES.has(key)) return true
    if (/^[A-Z]/.test(word) && key.length >= 3 && !SECOND_STOP.has(key)) return true
  }
  return false
}

function pairHit(text) {
  const re = /\b([A-Z][a-z]+)\s+([A-Z][A-Za-z'’-]+)\b/g
  for (const match of text.matchAll(re)) {
    const first = match[1].toLowerCase()
    const second = wordKey(match[2])
    if (!FIRST_NAMES.has(first)) continue
    if (second.length < 2 || SECOND_STOP.has(second)) continue
    return true
  }
  return false
}

function soloHit(text) {
  const re = /\b([A-Z][a-z]{2,})\b/g
  for (const match of text.matchAll(re)) {
    const key = match[1].toLowerCase()
    if (!FIRST_NAMES.has(key) || SECOND_STOP.has(key) || SOLO_SKIP.has(key)) continue
    return true
  }
  return false
}

function initialHit(text) {
  const named = /\b([A-Z])\.?\s+([A-Z][a-z]{2,})\b/g
  for (const match of text.matchAll(named)) {
    const second = wordKey(match[2])
    if (SECOND_STOP.has(second)) continue
    const dotted = text.slice(match.index, match.index + 2).includes(".")
    if ((match[1] === "A" || match[1] === "I") && !dotted) continue
    return true
  }
  const dotted = /\b([A-Z])\.\s*([A-Z])\./g
  const dottedOk = new Set(["AM", "PM", "US", "OK", "IE", "AC", "DC", "NY", "LA", "TV", "ID", "HR", "RN", "ER"])
  for (const match of text.matchAll(dotted)) {
    const pair = `${match[1]}${match[2]}`.toUpperCase()
    if (dottedOk.has(pair)) continue
    return true
  }
  return false
}

function capsHit(text) {
  const re = /\b([A-Z]{2,})\s+([A-Z]{2,})\b/g
  for (const match of text.matchAll(re)) {
    if (FIRST_NAMES.has(match[1].toLowerCase())) return true
  }
  return false
}

/** Drop person names from agency text. Company names and room words stay. */
export function redactPersonalNames(text) {
  if (!text || typeof text !== "string") return ""
  let out = text
  out = out.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "")
  out = out.replace(/\b(?:Mr|Mrs|Ms|Mx|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, "")
  out = out.replace(
    /\b(?:my name is|i am|i'm|i’m|named|called|aka|a\.k\.a\.)\s+[A-Za-z][A-Za-z'’-]+(?:\s+[A-Z][a-z]+)?/gi,
    "",
  )
  out = out.replace(
    /\b(?:Chef|Manager|Supervisor|Owner|Server|Cook|Bartender|Host|Sous|Boss|GM)\s+[A-Z][a-z]+\b/g,
    (match) => (roleHit(match) ? "" : match),
  )
  out = out.replace(/\b([A-Z][a-z]+)\s+([A-Z][A-Za-z'’-]+)\b/g, (match) => (pairHit(match) ? "" : match))
  out = out.replace(/\b([A-Z]{2,})\s+([A-Z]{2,})\b/g, (match) => (capsHit(match) ? "" : match))
  out = out.replace(/\b[A-Z]\.?\s+[A-Z][a-z]{2,}\b/g, (match) => (initialHit(match) ? "" : match))
  out = out.replace(/\b[A-Z]\.\s*[A-Z]\./g, (match) => (initialHit(match) ? "" : match))
  out = out.replace(/\b[A-Z][a-z]{2,}\b/g, (match) => (personalNameHit(match) === "solo" ? "" : match))
  return out
    .replace(/\b(to|for|by|of|from)\s+(to|for|by|of|from)\b/gi, "$2")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .trim()
}

export function filingNameError(fields) {
  for (const key of ["workplaceName", "city", "region"]) {
    if (personalNameHit(fields?.[key], { solo: false })) return NAME_BLOCK_MESSAGE
  }
  for (const key of ["context", "excerpt"]) {
    if (personalNameHit(fields?.[key])) return NAME_BLOCK_MESSAGE
  }
  return null
}
