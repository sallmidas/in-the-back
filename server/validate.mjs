import { INDUSTRIES, ROOM_KINDS } from "../shared/constants.mjs"
import { filingNameError } from "../shared/names.mjs"

const ROOM_SET = new Set(ROOM_KINDS)
const INDUSTRY_SET = new Set(INDUSTRIES)
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function slugify(name) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
  return slug || "workplace"
}

function asText(value) {
  if (typeof value !== "string") return ""
  return value.split("\0").join("").replace(/\r\n/g, "\n").trim()
}

export function parseEmail(value) {
  const email = asText(value).toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) return null
  return email
}

export function parsePassword(value) {
  if (typeof value !== "string") return { error: "Use a password of at least 10 characters." }
  if (value.length < 10 || value.length > 200) {
    return { error: "Use a password of at least 10 characters." }
  }
  return { password: value }
}

export function parseFiling(body) {
  const create = body?.create === true
  const workplaceName = asText(body?.workplaceName)
  const workplaceSlug = asText(body?.workplaceSlug)
  const city = asText(body?.city)
  const region = asText(body?.region)
  const industry = asText(body?.industry)
  const roomKind = asText(body?.roomKind)
  const context = asText(body?.context)
  const excerpt = asText(body?.excerpt)
  const score = Number(body?.score)

  if (!workplaceName || workplaceName.length > 80) {
    return { error: "Name the workplace." }
  }
  if (!ROOM_SET.has(roomKind)) return { error: "Pick a room." }
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return { error: "Score cleanliness, safety, and dignity from 1 to 10." }
  }
  if (body?.inRoom !== true) {
    return { error: "Confirm you were in this room. That is your word. We do not check it." }
  }
  if (!context || !excerpt) {
    return { error: "Shift context and writing are required. Never a name." }
  }
  if (context.length > 160) return { error: "Shift context is too long." }
  if (excerpt.length > 2000) return { error: "The writing is too long." }

  let resolvedIndustry = null
  if (create) {
    if (!city || city.length > 40) return { error: "Name the city. This is text, not a location pin." }
    if (!region || region.length > 40) return { error: "Name the region." }
    if (!INDUSTRY_SET.has(industry)) return { error: "Pick an industry." }
    resolvedIndustry = industry
  } else if (!SLUG_RE.test(workplaceSlug)) {
    return { error: "Pick a workplace that is already on the board." }
  }

  const nameError = filingNameError({
    context,
    excerpt,
    city,
    region,
    workplaceName,
  })
  if (nameError) return { error: nameError }

  return {
    value: {
      create,
      workplaceName,
      workplaceSlug,
      city,
      region,
      industry: resolvedIndustry,
      roomKind,
      context,
      excerpt,
      score: Math.round(score * 10) / 10,
      kind: body?.kind === "shout-out" ? "shout-out" : "report",
    },
  }
}
