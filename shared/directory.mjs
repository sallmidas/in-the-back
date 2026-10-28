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
  { id: "citations", label: "Has citations" },
  { id: "good", label: "Good news only" },
  { id: "none", label: "No public records found" },
]

export const DIRECTORY_SORTS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "recent", label: "Most recent record" },
  { id: "money", label: "Biggest fines/back wages" },
  { id: "citations", label: "Most citations" },
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

export function citationCount(records) {
  return records.filter(isFinding).reduce((count, record) => {
    if (Array.isArray(record.items) && record.items.length > 0) return count + record.items.length
    return count + 1
  }, 0)
}

export function moneyTotal(records) {
  return records.filter(isFinding).reduce((sum, record) => {
    return sum + (Number(record.penalty) || 0) + (Number(record.backWages) || 0)
  }, 0)
}

function moneyLabel(amount) {
  const rounded = Math.round(amount)
  return `$${rounded.toLocaleString("en-US")}`
}

export function recordChip(workplace, records) {
  const mine = placeRecords(workplace, records)
  const findings = mine.filter(isFinding)
  const good = mine.filter((record) => !isFinding(record))
  if (findings.length > 0) {
    const count = citationCount(findings)
    const money = moneyTotal(findings)
    const noun = count === 1 ? "citation" : "citations"
    return money > 0 ? `${count} ${noun} · ${moneyLabel(money)}` : `${count} ${noun}`
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
  if (!workplace.rooms?.length) return 0
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
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  })
  return sorted
}
