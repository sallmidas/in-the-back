import { createHash } from "node:crypto"
import { randomId } from "./passwords.mjs"
import { redactPersonalNames } from "../shared/names.mjs"
import { inLaunchArea, inLaunchIndustry, zip5 } from "./launch-area.mjs"

export const RECORD_SOURCES = ["ma-ag", "osha", "whd", "health", "osha-vpp-sharp", "hire-vets-medallion"]
export const RECORD_STATUSES = ["open", "closed", "contested", "settled", "abated", "reinspected"]

const STREET_WORDS = [
  [/(\bstreet)\b/g, "st"],
  [/(\bavenue)\b/g, "ave"],
  [/(\bboulevard)\b/g, "blvd"],
  [/(\bdrive)\b/g, "dr"],
  [/(\broad)\b/g, "rd"],
  [/(\blane)\b/g, "ln"],
  [/(\bcourt)\b/g, "ct"],
  [/(\bplace)\b/g, "pl"],
  [/(\bterrace)\b/g, "ter"],
  [/(\bparkway)\b/g, "pkwy"],
  [/(\bhighway)\b/g, "hwy"],
  [/(\bnorth)\b/g, "n"],
  [/(\bsouth)\b/g, "s"],
  [/(\beast)\b/g, "e"],
  [/(\bwest)\b/g, "w"],
]

const HEADER_ALIASES = {
  recordId: ["record_id", "record id", "citation_id", "citation number", "citation_number", "case_id", "case id", "case number", "activity_nr", "activity nr", "inspection_nr", "inspection number", "inspection_number"],
  recordDate: ["record_date", "citation_date", "citation date", "open_date", "case_open_date", "findings_end_date", "issuance_date", "date", "inspection_date"],
  street: ["street", "street_address", "site_address", "address", "estab_address", "street_addr", "site_address1"],
  city: ["city", "site_city", "city_nm"],
  region: ["state", "site_state", "st_cd", "region"],
  zip: ["zip", "zip_code", "site_zip", "zip_cd", "postal_code"],
  businessName: ["business_name", "establishment_name", "estab_name", "trade_nm", "legal_name", "employer", "company", "employer_name"],
  summary: ["summary", "wording", "violation", "violations", "narrative", "description", "standard", "findings", "citation_text"],
  backWages: ["back_wages", "bw_atp_amt", "restitution", "wages_due", "back wages"],
  penalty: ["penalty", "penalties", "current_penalty", "initial_penalty", "cmp_assd_amt", "civil_penalty", "fine"],
  status: ["status", "case_status", "abate_complete", "contest_status"],
  sourceUrl: ["source_url", "url", "link"],
  recordType: ["record_type", "type", "insp_type", "dataset"],
  naics: ["naics", "naics_code", "naic_cd"],
  violations: ["violation_items", "violation_count", "violations", "serious_items", "total_violations"],
  reason: ["inspection_reason", "insp_reason", "reason"],
  award: ["award", "title", "recognition"],
  year: ["year", "award_year"],
}

export function defaultMaxAgeYears(value) {
  if (value === undefined || value === null || value === "") {
    const fromEnv = process.env.ITB_RECORD_MAX_AGE_YEARS
    if (fromEnv === undefined || fromEnv === "") return 5
    value = fromEnv
  }
  const years = Number(value)
  if (!Number.isFinite(years) || years < 0) return 5
  return years
}

export function normalizeStreet(value) {
  let text = String(value ?? "")
    .toLowerCase()
    .replace(/#/g, " ")
    .replace(/[.,]/g, " ")
  text = text.replace(/\b(?:apt|apartment|suite|ste|unit|fl|floor|bldg|building)\b.*$/g, " ")
  for (const [pattern, short] of STREET_WORDS) text = text.replace(pattern, short)
  return text.replace(/[^a-z0-9]+/g, " ").trim()
}

export function normalizeCity(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Street plus city. A blank street does not match. Names are not part of the key. */
export function addressKey(street, city) {
  const road = normalizeStreet(street)
  const place = normalizeCity(city)
  if (!road || !place) return ""
  return `${road}|${place}`
}

export function creditLine(sourceAgency) {
  if (sourceAgency === "osha" || sourceAgency === "whd") return "Data: U.S. Department of Labor"
  if (sourceAgency === "ma-ag") return "Data: Massachusetts Attorney General"
  if (sourceAgency === "health") return "Data: city health department"
  return "Data: official government record"
}

export function agencyLabel(sourceAgency) {
  if (sourceAgency === "osha") return "OSHA"
  if (sourceAgency === "whd") return "U.S. DOL Wage and Hour"
  if (sourceAgency === "ma-ag") return "Massachusetts Attorney General"
  if (sourceAgency === "health") return "Health inspection"
  if (sourceAgency === "osha-vpp-sharp") return "OSHA VPP / SHARP"
  if (sourceAgency === "hire-vets-medallion") return "HIRE Vets Medallion"
  return "Public agency"
}

/** Wording for an inspection or case that found nothing. Never a whole-business rating. */
export function clearSummary(sourceAgency, recordDate) {
  if (sourceAgency === "osha") return `OSHA inspection, ${recordDate}: no citations issued.`
  if (sourceAgency === "whd") return `Wage and Hour case, ${recordDate}: no violations found.`
  return ""
}

const KEEP_ACRONYMS = new Set(["LLC", "USA", "XPO", "BBQ"])
const SUFFIX_CASE = { INC: "Inc.", LTD: "Ltd.", CORP: "Corp.", CO: "Co." }
const STREET_CASE = {
  AVE: "Ave",
  ST: "St",
  RD: "Rd",
  DR: "Dr",
  LN: "Ln",
  CT: "Ct",
  PL: "Pl",
  BLVD: "Blvd",
  HWY: "Hwy",
  PKWY: "Pkwy",
  TER: "Ter",
}

function titleWord(token) {
  const tail = token.match(/[,;:]+$/)?.[0] ?? ""
  const core = token.slice(0, token.length - tail.length)
  if (!core) return token
  if (core.includes("&")) return core.toUpperCase() + tail
  const upper = core.toUpperCase().replace(/\./g, "")
  if (SUFFIX_CASE[upper]) return SUFFIX_CASE[upper] + tail
  if (STREET_CASE[upper]) return STREET_CASE[upper] + tail
  if (KEEP_ACRONYMS.has(upper)) return upper + tail
  if (/^[A-Z]{2,3}$/.test(upper) && !/[AEIOU]/.test(upper)) return upper + tail
  if (/^[A-Z]$/.test(upper)) return upper + tail
  const pretty = core
    .toLowerCase()
    .replace(/(^|['’-])([a-z])/g, (_, mark, letter) => mark + letter.toUpperCase())
  return pretty + tail
}

/** All-caps agency text becomes readable title case. Mixed-case text is left as written. */
export function toReadableCase(value) {
  const text = String(value ?? "").trim()
  const letters = text.match(/[A-Za-z]/g) ?? []
  if (letters.length === 0 || letters.some((letter) => letter !== letter.toUpperCase())) return text
  return text
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : titleWord(part)))
    .join("")
}

/**
 * Friendly label for a NAICS code we import.
 * 722 food service, 445 grocery, other 44–45 retail, 48–49 transport and warehousing,
 * 311–312 food and beverage makers, other 31–33 manufacturing.
 */
export function industryFromNaics(naics) {
  const code = String(naics ?? "").replace(/\D/g, "")
  if (!code) return { industry: null, industryLabel: "" }
  if (code.startsWith("722")) return { industry: "restaurant", industryLabel: "Restaurant/Food service" }
  if (code.startsWith("445")) return { industry: "grocery", industryLabel: "Grocery" }
  if (code.startsWith("44") || code.startsWith("45")) return { industry: null, industryLabel: "Retail" }
  if (code.startsWith("48") || code.startsWith("49")) return { industry: "logistics", industryLabel: "Transport & warehousing" }
  if (code.startsWith("311") || code.startsWith("312")) return { industry: null, industryLabel: "Food & beverage maker" }
  if (code.startsWith("31") || code.startsWith("32") || code.startsWith("33")) {
    return { industry: null, industryLabel: "Manufacturing" }
  }
  return { industry: null, industryLabel: "" }
}

export function normalizeBusinessName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/\b(incorporated|corporation|company|limited|inc|llc|ltd|corp|co|dba)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseMoney(value) {
  if (value === null || value === undefined || value === "") return null
  const number = Number(String(value).replace(/[$,\s]/g, ""))
  if (!Number.isFinite(number)) return null
  return Math.round(number * 100) / 100
}

export function parseRecordDate(value) {
  const text = String(value ?? "").trim()
  if (!text) return ""
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  }
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const serial = Number(text)
    if (serial > 20000 && serial < 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000)
      return date.toISOString().slice(0, 10)
    }
  }
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const month = slash[1].padStart(2, "0")
    const day = slash[2].padStart(2, "0")
    return `${slash[3]}-${month}-${day}`
  }
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

export function mapStatus(value) {
  const text = String(value ?? "").trim().toLowerCase()
  if (!text) return "open"
  if (/re-?inspect|follow-?up/.test(text)) return "reinspected"
  if (/abate|correct/.test(text)) return "abated"
  if (/contest|appeal/.test(text)) return "contested"
  if (/settl|paid in full/.test(text)) return "settled"
  if (/close|final|complete|resolved/.test(text)) return "closed"
  if (/^y$|^yes$/.test(text)) return "abated"
  if (/open|pending|active|unresolved/.test(text)) return "open"
  return "open"
}

export function isStale(recordDate, now, maxAgeYears) {
  const date = parseRecordDate(recordDate)
  if (!date) return false
  const cutoff = new Date(now.getTime())
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - maxAgeYears)
  return Date.parse(`${date}T00:00:00Z`) < cutoff.getTime()
}

function headerKey(header) {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function pick(row, field) {
  const aliases = new Set(HEADER_ALIASES[field].map((item) => headerKey(item)))
  for (const [key, value] of Object.entries(row)) {
    if (aliases.has(headerKey(key))) return value
  }
  return ""
}

function looksLikeComplaints(rows) {
  const headers = Object.keys(rows[0] ?? {}).map(headerKey)
  const complaint = headers.some((header) => /complainant|complaint number|complaint id|complaint date/.test(header))
  const citation = headers.some((header) => /citation|enforcement|penalty|violation/.test(header))
  return complaint && !citation
}

function amount(value) {
  const number = Number(String(value ?? "").replace(/[$,\s]/g, ""))
  return Number.isFinite(number) ? number : 0
}

/** A citation, penalty, back-wage finding, or violation count. The inspection trigger is not a finding. */
export function hasFinding(row) {
  if (amount(pick(row, "violations")) > 0) return true
  if ((parseMoney(pick(row, "penalty")) ?? 0) > 0) return true
  if ((parseMoney(pick(row, "backWages")) ?? 0) > 0) return true
  const summary = String(pick(row, "summary") ?? "")
  return /\b(cited|citation|violation|back wages|penalty)\b/i.test(summary)
}

/**
 * Skip a complaint that was not upheld. An OSHA inspection that produced
 * citations is kept even when a complaint triggered it.
 */
export function bareComplaint(row) {
  const kind = `${pick(row, "recordType")} ${pick(row, "status")}`.toLowerCase()
  if (hasFinding(row)) return false
  if (/\bcomplaint\b/.test(kind)) return true
  return /not upheld|unfounded|no violation|dismissed|allegation only|withdrawn/.test(kind)
}

function cleanText(value) {
  const redacted = redactPersonalNames(String(value ?? "").replace(/\s+/g, " ").trim())
  return redacted.replace(/\s{2,}/g, " ").trim()
}

function sourceUrlFor(source, recordId, given) {
  const url = String(given ?? "").trim()
  if (url.startsWith("https://") || url.startsWith("http://")) return url
  if (source === "osha" && recordId) {
    return `https://www.osha.gov/ords/imis/establishment.inspection_detail?id=${encodeURIComponent(recordId)}`
  }
  if (source === "whd") return "https://dataportal.dol.gov/datasets/10362"
  if (source === "ma-ag") return "https://www.mass.gov/info-details/fair-labor-division-data"
  if (source === "osha-vpp-sharp") return "https://www.osha.gov/vpp"
  if (source === "hire-vets-medallion") return "https://www.hirevets.gov/"
  return ""
}

function recognitionSource(sourceAgency) {
  return sourceAgency === "osha-vpp-sharp" || sourceAgency === "hire-vets-medallion"
}

function stableId(parts) {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16)
}

export function rowsToRecords(rows, sourceAgency) {
  if (!RECORD_SOURCES.includes(sourceAgency)) {
    return { error: "Unknown source. Use ma-ag, osha, whd, or health.", records: [], skipped: 0 }
  }
  if (!Array.isArray(rows) || rows.length === 0) return { records: [], skipped: 0 }
  if (looksLikeComplaints(rows)) {
    return {
      error: "This file looks like complaints. Only citations and other upheld records are imported.",
      records: [],
      skipped: rows.length,
    }
  }
  const records = []
  let skipped = 0
  for (const row of rows) {
    if (!recognitionSource(sourceAgency) && (bareComplaint(row) || !rowInLaunch(row, sourceAgency))) {
      skipped += 1
      continue
    }
    if (recognitionSource(sourceAgency) && !inLaunchArea({ city: pick(row, "city"), region: pick(row, "region") })) {
      skipped += 1
      continue
    }
    const city = toReadableCase(cleanText(pick(row, "city")))
    const businessName = toReadableCase(cleanText(pick(row, "businessName"))) || "Business name withheld"
    const year = String(pick(row, "year") ?? "").trim()
    let recordDate = parseRecordDate(pick(row, "recordDate"))
    if (!recordDate && /^\d{4}$/.test(year)) recordDate = `${year}-01-01`
    let recordId = String(pick(row, "recordId") ?? "").trim()
    if (!recordId && recognitionSource(sourceAgency)) {
      recordId = stableId([sourceAgency, normalizeBusinessName(businessName), year, city])
    }
    const finding = hasFinding(row)
    const clearable = sourceAgency === "osha" || sourceAgency === "whd"
    const outcome = recognitionSource(sourceAgency) ? "recognition" : clearable && !finding ? "clear" : "finding"
    let summary = cleanText(pick(row, "summary"))
    if (outcome === "clear") summary = clearSummary(sourceAgency, recordDate)
    if (outcome === "recognition") {
      const award = cleanText(pick(row, "award")) || "Recognition"
      summary = year ? `${award}, ${year}.` : `${award}.`
    }
    if (!recordId || !recordDate || !city || !summary) {
      skipped += 1
      continue
    }
    const recordType = String(pick(row, "recordType") ?? "").trim().toLowerCase() || defaultRecordType(sourceAgency)
    records.push({
      sourceAgency,
      recordType: recordType.slice(0, 80),
      recordId: recordId.slice(0, 80),
      recordDate,
      street: toReadableCase(cleanText(pick(row, "street"))),
      city,
      region: cleanText(pick(row, "region")) || "MA",
      zip: String(pick(row, "zip") ?? "").replace(/[^\d-]/g, "").slice(0, 10),
      businessName: businessName.slice(0, 200),
      summary: summary.slice(0, 2000),
      backWages: parseMoney(pick(row, "backWages")),
      penalty: parseMoney(pick(row, "penalty")),
      status: mapStatus(pick(row, "status")),
      sourceUrl: sourceUrlFor(sourceAgency, recordId, pick(row, "sourceUrl")),
      naics: String(pick(row, "naics") ?? "").replace(/\D/g, "").slice(0, 8),
      ...industryFromNaics(pick(row, "naics")),
      reason: cleanText(pick(row, "reason")).slice(0, 80),
      outcome,
      awardLabel: recognitionSource(sourceAgency) ? cleanText(pick(row, "award")).slice(0, 120) : "",
    })
  }
  return { records, skipped }
}

function defaultRecordType(source) {
  if (source === "ma-ag") return "citation"
  if (source === "osha") return "inspection"
  if (source === "whd") return "case"
  return "health-inspection"
}

function rowInLaunch(row, sourceAgency) {
  const city = pick(row, "city")
  const region = pick(row, "region")
  if (!inLaunchArea({ city, region })) return false
  if (sourceAgency === "osha" || sourceAgency === "whd") return inLaunchIndustry(pick(row, "naics"))
  return true
}

export function filterLaunchRows(rows, sourceAgency = "osha") {
  return rows.filter((row) => rowInLaunch(row, sourceAgency))
}

export function isVisibleRecord(record, now, maxAgeYears) {
  if (!record || record.archivedAt) return false
  if (isStale(record.recordDate, now, maxAgeYears)) return false
  return true
}

export function visibleRecords(data, now = new Date(), maxAgeYears = defaultMaxAgeYears()) {
  return (data.publicRecords ?? []).filter((record) => isVisibleRecord(record, now, maxAgeYears))
}

function workplacesAt(data, street, city) {
  const key = addressKey(street, city)
  if (!key) return []
  return data.workplaces.filter((workplace) => addressKey(workplace.street, workplace.city) === key)
}

export function matchPublicRecords(data) {
  for (const record of data.publicRecords ?? []) {
    if (record.workplaceId && !data.workplaces.some((workplace) => workplace.id === record.workplaceId)) {
      record.workplaceId = null
    }
    if (record.workplaceId) continue
    const hits = workplacesAt(data, record.street, record.city)
    if (hits.length === 1) record.workplaceId = hits[0].id
  }
}

export function applyPublicRecords(data, incoming, options = {}) {
  if (!Array.isArray(data.publicRecords)) data.publicRecords = []
  if (!Array.isArray(data.recordErrors)) data.recordErrors = []
  const now = options.now instanceof Date ? options.now : new Date()
  const maxAgeYears = defaultMaxAgeYears(options.maxAgeYears)
  const byKey = new Map(data.publicRecords.map((record) => [`${record.sourceAgency}:${record.recordId}`, record]))
  let added = 0
  let updated = 0
  for (const row of incoming) {
    const key = `${row.sourceAgency}:${row.recordId}`
    const archived = isStale(row.recordDate, now, maxAgeYears)
    const existing = byKey.get(key)
    if (existing) {
      const workplaceId = existing.workplaceId ?? null
      const id = existing.id
      Object.assign(existing, row, {
        id,
        workplaceId,
        fetchedAt: now.toISOString(),
        archivedAt: archived ? existing.archivedAt || now.toISOString() : null,
      })
      delete existing.naics
      if (!existing.reason) delete existing.reason
      updated += 1
      continue
    }
    const record = {
      ...row,
      id: randomId("rec"),
      workplaceId: null,
      fetchedAt: now.toISOString(),
      archivedAt: archived ? now.toISOString() : null,
    }
    delete record.naics
    if (!record.reason) delete record.reason
    data.publicRecords.push(record)
    byKey.set(key, record)
    added += 1
  }
  matchPublicRecords(data)
  groupBusinesses(data)
  return { added, updated }
}

function locationKeys(record) {
  const name = normalizeBusinessName(record.businessName)
  if (!name || name === "business name withheld") return []
  const keys = []
  const street = addressKey(record.street, record.city)
  if (street) keys.push(`st:${name}|${street}`)
  const zip = zip5(record.zip)
  const city = normalizeCity(record.city)
  if (zip && city) keys.push(`z:${name}|${zip}|${city}`)
  return keys
}

/** One place per business. Same normalized name plus street+city, or the same ZIP and city. */
export function groupBusinesses(data) {
  const records = data.publicRecords ?? []
  const parent = records.map((_, index) => index)
  function find(index) {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]]
      index = parent[index]
    }
    return index
  }
  function unite(left, right) {
    const a = find(left)
    const b = find(right)
    if (a !== b) parent[b] = a
  }
  const seen = new Map()
  records.forEach((record, index) => {
    for (const key of locationKeys(record)) {
      const prior = seen.get(key)
      if (prior !== undefined) unite(prior, index)
      else seen.set(key, index)
    }
  })
  const groups = new Map()
  records.forEach((record, index) => {
    const root = find(index)
    const list = groups.get(root) ?? []
    list.push(record)
    groups.set(root, list)
  })
  for (const group of groups.values()) {
    const ambiguous = group.some((record) => workplacesAt(data, record.street, record.city).length > 1)
    if (ambiguous) continue
    const linked = group.find((record) => record.workplaceId && data.workplaces.some((place) => place.id === record.workplaceId))
    let workplace = linked
      ? data.workplaces.find((place) => place.id === linked.workplaceId)
      : null
    if (!workplace) {
      const sample = group.find((record) => record.street) ?? group[0]
      const addressHits = workplacesAt(data, sample.street, sample.city)
      const named = addressHits.filter(
        (place) => normalizeBusinessName(place.name) === normalizeBusinessName(sample.businessName),
      )
      if (named.length === 1) workplace = named[0]
      else if (addressHits.length > 1) continue
      else workplace = createPlaceForRecord(data, sample, { sameNameOnly: true }).workplace
    }
    if (!workplace) continue
    refreshPlace(workplace, group)
    for (const record of group) {
      if (!record.workplaceId) record.workplaceId = workplace.id
    }
  }
}

function refreshPlace(workplace, group) {
  const named = [...group].sort((left, right) => right.businessName.length - left.businessName.length)[0]
  if (named?.businessName) workplace.name = named.businessName
  const street = group.find((record) => record.street)?.street
  if (street) workplace.street = street
  const city = group.find((record) => record.city)?.city
  if (city) workplace.city = city
  const zip = group.find((record) => record.zip)?.zip
  if (zip) workplace.zip = zip
  const label = group.map((record) => record.industryLabel).find(Boolean)
  if (label) workplace.industryLabel = label
  const industry = group.map((record) => record.industry).find(Boolean)
  if (industry) workplace.industry = industry
}

export async function importPublicRows(store, rows, sourceAgency, options = {}) {
  const parsed = rowsToRecords(rows, sourceAgency)
  if (parsed.error) return { status: 400, error: parsed.error, ...parsed }
  const result = await store.update((data) => {
    const counts = applyPublicRecords(data, parsed.records, options)
    return { status: 200, ...counts, skipped: parsed.skipped }
  })
  return result
}

export function publicRecordView(data, record) {
  const workplace = record.workplaceId
    ? data.workplaces.find((item) => item.id === record.workplaceId)
    : null
  return {
    id: record.id,
    sourceAgency: record.sourceAgency,
    agencyLabel: agencyLabel(record.sourceAgency),
    credit: creditLine(record.sourceAgency),
    recordType: record.recordType,
    recordId: record.recordId,
    recordDate: record.recordDate,
    street: record.street,
    city: record.city,
    region: record.region,
    zip: record.zip,
    businessName: record.businessName,
    summary: record.summary,
    backWages: record.backWages,
    penalty: record.penalty,
    status: record.status,
    sourceUrl: record.sourceUrl,
    fetchedAt: record.fetchedAt,
    outcome: record.outcome || "finding",
    awardLabel: record.awardLabel || "",
    reply: approvedReply(data, record.id),
    workplaceId: workplace?.id ?? null,
    workplaceSlug: workplace?.slug ?? null,
    workplaceName: workplace?.name ?? null,
  }
}

export function createPlaceForRecord(data, record, options = {}) {
  const hits = workplacesAt(data, record.street, record.city)
  const sameName = hits.filter(
    (place) => normalizeBusinessName(place.name) === normalizeBusinessName(record.businessName),
  )
  if (sameName.length === 1) {
    record.workplaceId = sameName[0].id
    return { workplace: sameName[0], created: false }
  }
  if (!options.sameNameOnly && hits.length === 1) {
    record.workplaceId = hits[0].id
    return { workplace: hits[0], created: false }
  }
  if (hits.length > 1) return { error: "More than one place has this address. Link it by hand." }
  let slug = slugFrom(record.businessName)
  if (data.workplaces.some((workplace) => workplace.slug === slug)) {
    slug = slugFrom(`${record.businessName} ${record.city}`)
  }
  let n = 2
  const base = slug
  while (data.workplaces.some((workplace) => workplace.slug === slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  const workplace = {
    id: randomId("wp"),
    slug,
    name: record.businessName,
    industry: record.industry ?? null,
    industryLabel: record.industryLabel || "",
    city: record.city,
    region: record.region || "MA",
    street: record.street,
    zip: record.zip,
    createdAt: new Date().toISOString(),
    claimOnly: true,
  }
  data.workplaces.push(workplace)
  record.workplaceId = workplace.id
  matchPublicRecords(data)
  return { workplace, created: true }
}

function approvedReply(data, recordId) {
  const reply = (data.recordReplies ?? []).find((item) => item.recordId === recordId && item.status === "approved")
  return reply ? reply.text : null
}

function slugFrom(value) {
  const slug = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "place"
}
