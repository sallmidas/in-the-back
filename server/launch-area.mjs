/**
 * Western Massachusetts launch area: every city and town in Hampden,
 * Hampshire, Franklin, and Berkshire counties, plus postal village names
 * that show up on agency filings for those towns.
 *
 * Matching a record to a place on the board still uses street + city.
 * This list only decides whether a row is in the launch area.
 * Change the towns here and nowhere else.
 */

const BERKSHIRE = [
  "Adams",
  "Alford",
  "Becket",
  "Cheshire",
  "Clarksburg",
  "Dalton",
  "Egremont",
  "Florida",
  "Great Barrington",
  "Hancock",
  "Hinsdale",
  "Lanesborough",
  "Lee",
  "Lenox",
  "Monterey",
  "Mount Washington",
  "New Ashford",
  "New Marlborough",
  "North Adams",
  "Otis",
  "Peru",
  "Pittsfield",
  "Richmond",
  "Sandisfield",
  "Savoy",
  "Sheffield",
  "Stockbridge",
  "Tyringham",
  "Washington",
  "West Stockbridge",
  "Williamstown",
  "Windsor",
]

const FRANKLIN = [
  "Ashfield",
  "Bernardston",
  "Buckland",
  "Charlemont",
  "Colrain",
  "Conway",
  "Deerfield",
  "Erving",
  "Gill",
  "Greenfield",
  "Hawley",
  "Heath",
  "Leverett",
  "Leyden",
  "Monroe",
  "Montague",
  "New Salem",
  "Northfield",
  "Orange",
  "Rowe",
  "Shelburne",
  "Shutesbury",
  "Sunderland",
  "Warwick",
  "Wendell",
  "Whately",
]

const HAMPDEN = [
  "Agawam",
  "Blandford",
  "Brimfield",
  "Chester",
  "Chicopee",
  "East Longmeadow",
  "Granville",
  "Hampden",
  "Holland",
  "Holyoke",
  "Longmeadow",
  "Ludlow",
  "Monson",
  "Montgomery",
  "Palmer",
  "Russell",
  "Southwick",
  "Springfield",
  "Tolland",
  "Wales",
  "West Springfield",
  "Westfield",
  "Wilbraham",
]

const HAMPSHIRE = [
  "Amherst",
  "Belchertown",
  "Chesterfield",
  "Cummington",
  "Easthampton",
  "Goshen",
  "Granby",
  "Hadley",
  "Hatfield",
  "Huntington",
  "Middlefield",
  "Northampton",
  "Pelham",
  "Plainfield",
  "South Hadley",
  "Southampton",
  "Ware",
  "Westhampton",
  "Williamsburg",
  "Worthington",
]

/** Village and spelling variants used on filings inside the towns above. */
const POSTAL_VILLAGES = [
  "Drury",
  "Feeding Hills",
  "Florence",
  "Housatonic",
  "Leeds",
  "New Marlboro",
  "Shelburne Falls",
  "South Deerfield",
  "South Egremont",
  "Turners Falls",
  "West Hatfield",
]

export const WESTERN_MASS_TOWNS = [
  ...BERKSHIRE,
  ...FRANKLIN,
  ...HAMPDEN,
  ...HAMPSHIRE,
  ...POSTAL_VILLAGES,
]

/**
 * Industries the board loads.
 * 722 restaurants and other food service.
 * 44 and 45 retail, which includes grocery 445.
 * 48 and 49 warehousing, transport, and couriers.
 * 311 food manufacturing, including bakeries.
 * Construction, other manufacturing, and healthcare are not in this list.
 */
export const LAUNCH_NAICS_PREFIXES = ["722", "44", "45", "48", "49", "311"]

const TOWN_NAMES = new Set()
for (const town of WESTERN_MASS_TOWNS) {
  const base = normalizeTown(town)
  TOWN_NAMES.add(base)
  for (const [long, short] of [
    [/^east /, "e "],
    [/^west /, "w "],
    [/^north /, "n "],
    [/^south /, "s "],
    [/^mount /, "mt "],
  ]) {
    if (long.test(base)) TOWN_NAMES.add(base.replace(long, short))
  }
}

export function normalizeTown(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\b(mount|mt)\.?\s+/g, "mount ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^e /, "east ")
    .replace(/^w /, "west ")
    .replace(/^n /, "north ")
    .replace(/^s /, "south ")
    .replace(/^mt /, "mount ")
}

export function zip5(value) {
  const digits = String(value ?? "").replace(/\D/g, "")
  if (digits.length === 4) return `0${digits}`
  return digits.length >= 5 ? digits.slice(0, 5) : ""
}

/** Town name in the four western counties. State must be Massachusetts when it is present. */
export function inLaunchArea({ city, region }) {
  const state = String(region ?? "").trim().toLowerCase()
  if (state && state !== "ma" && state !== "massachusetts") return false
  const place = normalizeTown(city)
  if (!place) return false
  if (TOWN_NAMES.has(place)) return true
  const shortened = place
    .replace(/^east /, "e ")
    .replace(/^west /, "w ")
    .replace(/^north /, "n ")
    .replace(/^south /, "s ")
    .replace(/^mount /, "mt ")
  return TOWN_NAMES.has(shortened) || TOWN_NAMES.has(normalizeTown(shortened))
}

export function inLaunchIndustry(naics) {
  const code = String(naics ?? "").replace(/\D/g, "")
  if (!code) return false
  return LAUNCH_NAICS_PREFIXES.some((prefix) => code.startsWith(prefix))
}
