/** Springfield and Chicopee, Massachusetts. ZIP lists are the launch filter. */

export const LAUNCH_CITIES = ["springfield", "chicopee"]

export const LAUNCH_ZIPS = new Set([
  "01101",
  "01102",
  "01103",
  "01104",
  "01105",
  "01107",
  "01108",
  "01109",
  "01111",
  "01115",
  "01118",
  "01119",
  "01128",
  "01129",
  "01138",
  "01139",
  "01144",
  "01151",
  "01152",
  "01199",
  "01013",
  "01014",
  "01020",
  "01021",
  "01022",
])

/** Restaurant / food service (722) and retail (44, 45). */
export const LAUNCH_NAICS_PREFIXES = ["722", "44", "45"]

export function zip5(value) {
  const digits = String(value ?? "").replace(/\D/g, "")
  return digits.length >= 5 ? digits.slice(0, 5) : ""
}

export function inLaunchArea({ city, region, zip }) {
  const code = zip5(zip)
  if (LAUNCH_ZIPS.has(code)) return true
  const state = String(region ?? "").trim().toLowerCase()
  const place = String(city ?? "").trim().toLowerCase()
  if ((state === "ma" || state === "massachusetts") && LAUNCH_CITIES.includes(place)) return true
  return false
}

export function inLaunchIndustry(naics) {
  const code = String(naics ?? "").replace(/\D/g, "")
  if (!code) return false
  return LAUNCH_NAICS_PREFIXES.some((prefix) => code.startsWith(prefix))
}
