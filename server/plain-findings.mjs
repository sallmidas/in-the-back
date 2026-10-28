/**
 * Plain-English lines for OSHA citations and Wage and Hour findings.
 * Topics match the most specific standard prefix. Unknown rules keep the CFR number.
 */

const OSHA_TOPICS = [
  ["1910.1200", "chemical hazard labels and training"],
  ["1910.1030", "bloodborne pathogens"],
  ["1910.1053", "silica dust exposure"],
  ["1910.1028", "benzene exposure"],
  ["1910.1027", "cadmium exposure"],
  ["1910.1026", "chromium exposure"],
  ["1910.1025", "lead exposure"],
  ["1910.1018", "arsenic exposure"],
  ["1910.1048", "formaldehyde exposure"],
  ["1910.1001", "asbestos exposure"],
  ["1910.1000", "air contaminants"],
  ["1910.1020", "access to exposure and medical records"],
  ["1910.305", "electrical hazards"],
  ["1910.304", "electrical wiring design"],
  ["1910.303", "electrical hazards"],
  ["1910.335", "electrical safeguards for people"],
  ["1910.334", "use of electrical equipment"],
  ["1910.333", "electrical work practices"],
  ["1910.332", "electrical safety training"],
  ["1910.272", "grain-handling hazards"],
  ["1910.269", "electric power work"],
  ["1910.254", "arc welding"],
  ["1910.253", "oxygen-fuel welding"],
  ["1910.252", "welding and cutting"],
  ["1910.243", "portable power tools"],
  ["1910.242", "hand and portable tools"],
  ["1910.219", "unguarded moving machine parts"],
  ["1910.215", "abrasive wheel guards"],
  ["1910.213", "woodworking machine guards"],
  ["1910.212", "machines missing safety guards"],
  ["1910.184", "unsafe slings or rigging"],
  ["1910.179", "overhead crane safety"],
  ["1910.178", "forklift safety"],
  ["1910.176", "materials storage and handling"],
  ["1910.165", "employee alarm system"],
  ["1910.157", "fire extinguishers"],
  ["1910.151", "first aid and eyewash"],
  ["1910.147", "lockout/tagout, machines not locked off during repair"],
  ["1910.146", "confined spaces"],
  ["1910.145", "missing safety signs or tags"],
  ["1910.142", "temporary labor camp conditions"],
  ["1910.141", "wash-up and sanitation"],
  ["1910.138", "hand protection"],
  ["1910.137", "electrical protective gear"],
  ["1910.136", "foot protection"],
  ["1910.135", "head protection"],
  ["1910.134", "respirators"],
  ["1910.133", "eye and face protection"],
  ["1910.132", "protective gear"],
  ["1910.120", "hazardous-waste emergency response"],
  ["1910.119", "chemical process safety"],
  ["1910.111", "anhydrous ammonia"],
  ["1910.110", "liquefied petroleum gas"],
  ["1910.107", "spray finishing"],
  ["1910.106", "flammable liquids"],
  ["1910.95", "noise and hearing protection"],
  ["1910.39", "fire prevention plan"],
  ["1910.38", "emergency action plan"],
  ["1910.37", "blocked or unsafe exits"],
  ["1910.36", "blocked or unsafe exits"],
  ["1910.30", "fall-protection training"],
  ["1910.29", "fall-protection equipment"],
  ["1910.28", "missing fall protection"],
  ["1910.27", "scaffolds or rope descent"],
  ["1910.26", "dockboards"],
  ["1910.25", "stairways"],
  ["1910.24", "step bolts and ladders"],
  ["1910.23", "ladders"],
  ["1910.22", "slippery or cluttered floors and walkways"],
  ["1904.41", "electronic injury and illness logs"],
  ["1904.39", "reporting a death or severe injury"],
  ["1904.29", "injury log details"],
  ["1904", "injury and illness recordkeeping"],
  ["1903.19", "not showing proof hazards were fixed"],
  ["1926.1400", "crane safety"],
  ["1926.1153", "silica dust on a construction site"],
  ["1926.1101", "asbestos on a construction site"],
  ["1926.1060", "stair and ladder training"],
  ["1926.1053", "ladders"],
  ["1926.1052", "stairways"],
  ["1926.1051", "stairs and ladders"],
  ["1926.652", "cave-in protection in a trench"],
  ["1926.651", "excavation hazards"],
  ["1926.503", "fall protection"],
  ["1926.502", "fall-protection equipment"],
  ["1926.501", "fall protection"],
  ["1926.454", "scaffold training"],
  ["1926.453", "aerial lifts"],
  ["1926.451", "scaffolds"],
  ["1926.416", "electrical safety on a construction site"],
  ["1926.405", "electrical wiring on a construction site"],
  ["1926.404", "electrical wiring design on a construction site"],
  ["1926.350", "gas welding"],
  ["1926.304", "woodworking tools"],
  ["1926.300", "hand and power tools"],
  ["1926.251", "rigging"],
  ["1926.152", "flammable liquids on a construction site"],
  ["1926.150", "fire protection on a construction site"],
  ["1926.103", "respirators on a construction site"],
  ["1926.102", "eye and face protection"],
  ["1926.100", "head protection"],
  ["1926.95", "protective gear"],
  ["1926.62", "lead exposure on a construction site"],
  ["1926.59", "chemical hazard labels and training"],
  ["1926.55", "air contaminants on a construction site"],
  ["1926.50", "first aid"],
  ["1926.28", "protective gear"],
  ["1926.25", "housekeeping on a construction site"],
  ["1926.21", "safety training"],
  ["1926.20", "the contractor safety program"],
  ["5(a)(1)", "General Duty Clause, a known serious hazard"],
]

const TOPIC_LIST = [...OSHA_TOPICS].sort((left, right) => right[0].length - left[0].length)

const WHD_LAWS = [
  ["flsa 14(c)", "Subminimum wage"],
  ["child labor", "Child labor"],
  ["minimum wage/overtime", "Minimum wage and overtime"],
  ["fair labor standards act", "Minimum wage and overtime"],
  ["h-2a", "Farm guest-worker rules (H-2A)"],
  ["davis-bacon", "Prevailing wage on public construction"],
  ["family and medical leave", "Family and medical leave"],
  ["service contract act", "Service-contract wage rules"],
  ["migrant and seasonal", "Migrant and seasonal farm work"],
]

export function gravityLabel(gravity) {
  const text = String(gravity ?? "").trim().toLowerCase()
  if (text.startsWith("willful")) return "Willful: knowingly ignored the rule"
  if (text.startsWith("repeat")) return "Repeat: same violation cited before"
  if (text.startsWith("other-than-serious") || text === "other") return "Minor"
  if (text.startsWith("serious")) return "Serious (could cause serious injury)"
  return gravity ? String(gravity) : "Cited"
}

export const GRAVITY_LEGEND =
  "Serious means it could cause serious injury. Minor is other-than-serious. Willful means the rule was knowingly ignored. Repeat means the same violation was cited before."

export function standardKey(standard) {
  const text = String(standard ?? "").replace(/\s+/g, "")
  const duty = text.match(/5\(a\)\(1\)/i)
  if (duty) return "5(a)(1)"
  const numbered = text.match(/(\d{3,4}\.\d+)/)
  if (numbered) return numbered[1]
  const part = text.match(/\b(1903|1904|1910|1926)\b/)
  return part ? part[1] : ""
}

export function plainTopic(standard) {
  const key = standardKey(standard)
  if (!key) return `Safety rule violation (${displayStandard(standard)})`
  const hit = TOPIC_LIST.find(([prefix]) => key === prefix || key.startsWith(prefix))
  if (hit) return hit[1]
  return `Safety rule violation (${displayStandard(standard)})`
}

function displayStandard(standard) {
  const text = String(standard ?? "").trim()
  if (!text) return "29 CFR"
  if (/^5\(a\)\(1\)/i.test(text)) return "Section 5(a)(1)"
  if (/29\s*CFR/i.test(text)) return text.replace(/\s+/g, " ")
  return `29 CFR ${text}`
}

function money(value) {
  const number = Number(String(value ?? "").replace(/[$,\s]/g, ""))
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null
}

function moneyLabel(amount) {
  if (amount === null || amount === undefined) return ""
  const rounded = Math.round(amount * 100) / 100
  const text = Number.isInteger(rounded) ? rounded.toLocaleString("en-US") : rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `$${text}`
}

export function parseOshaCitations(summary) {
  const text = String(summary ?? "")
  const parts = text.split(/\s*;\s*/).map((part) => part.trim()).filter(Boolean)
  const items = []
  for (const part of parts) {
    const match = part.match(
      /Citation\s+\S+:\s*([A-Za-z-]+(?:\s+[A-Za-z-]+)?)\s*-\s*(.+?)\s*\(penalty\s*\$([0-9,.]+)\)(?:\s*,\s*issued\s*(\d{4}-\d{2}-\d{2}))?/i,
    )
    if (!match) continue
    const standard = match[2].trim()
    const penalty = money(match[3])
    const issued = match[4] || ""
    const topic = plainTopic(standard)
    const fine = penalty === null ? "" : `, ${moneyLabel(penalty)} fine`
    const when = issued ? ` (issued ${issued})` : ""
    items.push({
      label: gravityLabel(match[1]),
      detail: `${topic}${fine}${when}`,
      standard: displayStandard(standard),
      penalty,
      issued,
    })
  }
  return items
}

function whdLawLabel(name) {
  const text = String(name ?? "").trim().toLowerCase()
  const hit = WHD_LAWS.find(([needle]) => text.includes(needle))
  if (hit) return hit[1]
  const cleaned = String(name ?? "").replace(/^WHD found\s+/i, "").trim()
  return cleaned || "Wage and hour rule"
}

export function parseWhdFindings(summary, columns = {}) {
  const text = String(summary ?? "")
  const items = []
  const pattern = /(?:WHD found\s+)?([^:;]+?):\s*(\d+)\s*violation\(s\)([^.;]*)/gi
  let match
  while ((match = pattern.exec(text))) {
    const label = whdLawLabel(match[1])
    const count = Number(match[2])
    const extra = match[3] || ""
    const wages = extra.match(/back wages\s*\$([0-9,.]+)/i)
    const minors = extra.match(/minors employed in violation:\s*(\d+)/i)
    const bits = [`${count} violation${count === 1 ? "" : "s"}`]
    if (wages) bits.push(`${moneyLabel(money(wages[1]))} back wages`)
    if (minors) bits.push(`${minors[1]} minors`)
    items.push({
      label,
      detail: bits.join(", "),
      standard: match[1].replace(/^WHD found\s+/i, "").trim(),
      penalty: null,
      issued: "",
    })
  }
  const workers = Number(String(columns.workers ?? "").replace(/[^\d]/g, "")) || 0
  if (workers && items.length) {
    const wageItem = items.find((item) => /back wages/i.test(item.detail)) ?? items[0]
    if (!/worker/i.test(wageItem.detail)) {
      wageItem.detail += ` for ${workers} worker${workers === 1 ? "" : "s"}`
    }
  }
  if (items.length === 0 && (money(columns.backWages) || money(columns.penalty) || Number(columns.violations) > 0)) {
    const count = Number(columns.violations) || 0
    const wages = money(columns.backWages)
    const workers = Number(columns.workers) || 0
    const bits = []
    if (count) bits.push(`${count} violation${count === 1 ? "" : "s"}`)
    if (wages) bits.push(`${moneyLabel(wages)} back wages`)
    if (workers) bits.push(`${workers} worker${workers === 1 ? "" : "s"}`)
    if (bits.length) {
      items.push({
        label: "Minimum wage and overtime",
        detail: bits.join(", "),
        standard: "Fair Labor Standards Act",
        penalty: null,
        issued: "",
      })
    }
  }
  return items
}

export function findingLines(sourceAgency, summary, columns = {}) {
  if (sourceAgency === "osha") return parseOshaCitations(summary)
  if (sourceAgency === "whd") return parseWhdFindings(summary, columns)
  return []
}

export function findingTotal(items, columns = {}) {
  const count = items.length || Number(columns.violations) || 0
  const penaltyFromItems = items.reduce((sum, item) => sum + (item.penalty || 0), 0)
  const penalty = money(columns.penalty)
  const backWages = money(columns.backWages)
  const fine = penalty !== null && penalty !== undefined ? penalty : penaltyFromItems || null
  const bits = []
  if (count) bits.push(`${count} item${count === 1 ? "" : "s"}`)
  if (fine) bits.push(`${moneyLabel(fine)} in fines`)
  if (backWages) bits.push(`${moneyLabel(backWages)} back wages`)
  return bits.join(", ")
}
