/** Directory filters for public records. URL values stay short so a shared link keeps the view. */

export const RECORD_INDUSTRY_OPTIONS = [
  { id: "food-service", label: "Restaurant/Food service" },
  { id: "grocery", label: "Grocery" },
  { id: "retail", label: "Retail" },
  { id: "transport", label: "Transport & warehousing" },
  { id: "food-maker", label: "Food & beverage maker" },
  { id: "manufacturing", label: "Manufacturing" },
]

const LEGACY_INDUSTRY = {
  restaurant: "food-service",
  diner: "food-service",
  "fine-dining": "food-service",
  pub: "food-service",
  banquet: "food-service",
  grocery: "grocery",
  logistics: "transport",
}

const ROOM_LABELS = {
  kitchen: "Kitchen",
  "dish-pit": "Dish pit",
  "walk-in": "Walk-in",
  "staff-bathroom": "Staff bathroom",
  "break-room": "Break room",
  dock: "Dock",
  stock: "Stock",
  overnight: "Overnight",
}

export const RECORD_FILTERS = [
  { id: "all", label: "All" },
  { id: "citations", label: "Has citations or wage cases" },
  { id: "good", label: "Good news only" },
  { id: "none", label: "No public records found" },
]

export const DIRECTORY_SORTS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "recent", label: "Most recent record" },
  { id: "money", label: "Biggest fines/back wages" },
  { id: "citations", label: "Most citations" },
  { id: "high", label: "Highest rated" },
  { id: "low", label: "Lowest rated" },
]

function industryKey(workplace) {
  const label = workplace.industryLabel || ""
  const fromLabel = RECORD_INDUSTRY_OPTIONS.find((option) => option.label === label)
  if (fromLabel) return fromLabel.id
  return LEGACY_INDUSTRY[workplace.industry] || ""
}

export function placeRecords(workplace, records) {
  return (records ?? []).filter(
    (record) => record.workplaceId === workplace.id || record.workplaceSlug === workplace.slug,
  )
}

function isFinding(record) {
  return record.outcome !== "clear" && record.outcome !== "recognition"
}

function isWageCase(record) {
  return record.sourceAgency === "whd" || record.sourceAgency === "ma-ag"
}

export function citationCount(records) {
  return records.filter((record) => isFinding(record) && !isWageCase(record)).reduce((count, record) => {
    if (Array.isArray(record.items) && record.items.length > 0) return count + record.items.length
    return count + 1
  }, 0)
}

export function wageCaseCount(records) {
  return records.filter((record) => isFinding(record) && isWageCase(record)).length
}

function moneyOf(records) {
  return records.reduce((sum, record) => sum + (Number(record.penalty) || 0) + (Number(record.backWages) || 0), 0)
}

export function moneyTotal(records) {
  return moneyOf(records.filter(isFinding))
}

function moneyLabel(amount) {
  const rounded = Math.round(Number(amount) * 100) / 100
  if (!Number.isFinite(rounded)) return ""
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `$${text}`
}

function sumField(records, field) {
  return records.reduce((sum, record) => sum + (Number(record[field]) || 0), 0)
}

export function recordChip(workplace, records) {
  const mine = placeRecords(workplace, records)
  const findings = mine.filter(isFinding)
  const good = mine.filter((record) => !isFinding(record))
  if (findings.length > 0) {
    const parts = []
    const citations = citationCount(findings)
    const wages = wageCaseCount(findings)
    if (citations > 0) {
      const noun = citations === 1 ? "citation" : "citations"
      const money = moneyOf(findings.filter((record) => !isWageCase(record)))
      parts.push(money > 0 ? `${citations} ${noun} · ${moneyLabel(money)}` : `${citations} ${noun}`)
    }
    if (wages > 0) {
      const noun = wages === 1 ? "wage case" : "wage cases"
      const wageRecords = findings.filter(isWageCase)
      const backWages = sumField(wageRecords, "backWages")
      const fines = sumField(wageRecords, "penalty")
      const bits = [`${wages} ${noun}`]
      if (backWages > 0) bits.push(`${moneyLabel(backWages)} back wages`)
      if (fines > 0) bits.push(`${moneyLabel(fines)} fines`)
      parts.push(bits.join(" · "))
    }
    if (parts.length > 0) return parts.join(" · ")
  }
  if (good.length > 0) {
    const latest = [...good].sort((left, right) => String(right.recordDate).localeCompare(String(left.recordDate)))[0]
    const year = String(latest.recordDate || "").slice(0, 4)
    if (latest.outcome === "recognition") {
      return `${latest.awardLabel || "Recognition"}${year ? ` ${year}` : ""}`
    }
    if (latest.sourceAgency === "whd") return `No violations found${year ? ` ${year}` : ""}`
    return `Passed inspection${year ? ` ${year}` : ""}`
  }
  return "No public records found"
}

export function directoryTowns(workplaces) {
  return [...new Set(workplaces.map((workplace) => workplace.city).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  )
}

function overallScore(workplace) {
  if (!workplace.rooms?.length) return null
  const sum = workplace.rooms.reduce((acc, room) => acc + room.score, 0)
  return sum / workplace.rooms.length
}

function matchesQuery(workplace, query) {
  if (!query) return true
  const rooms = (workplace.rooms ?? []).map((room) => ROOM_LABELS[room.kind] || room.kind).join(" ")
  const haystack = `${workplace.name} ${workplace.city} ${workplace.region} ${workplace.blurb || ""} ${rooms}`.toLowerCase()
  return haystack.includes(query)
}

function matchesIndustry(workplace, industry) {
  if (!industry || industry === "all") return true
  if (RECORD_INDUSTRY_OPTIONS.some((option) => option.id === industry)) {
    return industryKey(workplace) === industry
  }
  return workplace.industry === industry
}

function matchesRecords(workplace, records, mode) {
  if (!mode || mode === "all") return true
  const mine = placeRecords(workplace, records)
  const findings = mine.filter(isFinding)
  const good = mine.filter((record) => !isFinding(record))
  if (mode === "citations") return findings.length > 0
  if (mode === "good") return good.length > 0 && findings.length === 0
  if (mode === "none") return mine.length === 0
  return true
}

function latestDate(workplace, records) {
  const dates = placeRecords(workplace, records).map((record) => record.recordDate || "")
  return dates.sort().at(-1) || ""
}

export function filterAndSortWorkplaces(workplaces, records, filters = {}) {
  const query = filters.query?.trim().toLowerCase() ?? ""
  const industry = filters.industry ?? "all"
  const room = filters.room ?? "all"
  const band = filters.band ?? "all"
  const town = filters.town ?? ""
  const recordsMode = filters.records ?? "all"
  const sort = filters.sort || "name"

  const matched = workplaces.filter((workplace) => {
    if (!matchesQuery(workplace, query)) return false
    if (!matchesIndustry(workplace, industry)) return false
    if (room !== "all" && !(workplace.rooms ?? []).some((item) => item.kind === room)) return false
    if (band !== "all") {
      const score = overallScore(workplace)
      if (score === null) return false
      if (band === "struggling" && score > 4.5) return false
      if (band === "mixed" && (score <= 4.5 || score >= 7.5)) return false
      if (band === "solid" && score < 7.5) return false
    }
    if (town && workplace.city !== town) return false
    if (!matchesRecords(workplace, records, recordsMode)) return false
    return true
  })

  const sorted = [...matched]
  sorted.sort((left, right) => {
    if (sort === "recent") {
      const byDate = latestDate(right, records).localeCompare(latestDate(left, records))
      if (byDate) return byDate
    } else if (sort === "money") {
      const byMoney = moneyTotal(placeRecords(right, records)) - moneyTotal(placeRecords(left, records))
      if (byMoney) return byMoney
    } else if (sort === "citations") {
      const byCount = citationCount(placeRecords(right, records)) - citationCount(placeRecords(left, records))
      if (byCount) return byCount
    } else if (sort === "high" || sort === "low") {
      const leftScore = overallScore(left)
      const rightScore = overallScore(right)
      if (leftScore === null && rightScore === null) {
        /* fall through to name */
      } else if (leftScore === null) return 1
      else if (rightScore === null) return -1
      else {
        const byScore = sort === "high" ? rightScore - leftScore : leftScore - rightScore
        if (byScore) return byScore
      }
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  })
  return sorted
}
