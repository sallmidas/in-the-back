import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import path from "node:path"
import { INDUSTRIES, ROOM_KINDS, compareRooms } from "../shared/constants.mjs"
import { createStore } from "./store.mjs"
import {
  hashPassword,
  normalizeReceipt,
  randomId,
  randomReceipt,
  randomToken,
  safeEqualHex,
  sha256,
  verifyPassword,
} from "./passwords.mjs"
import { clientAddress } from "./client-ip.mjs"
import { parseStoreClaim } from "./store-claims.mjs"
import { parseEmail, parseFiling, parsePassword, slugify } from "./validate.mjs"
import { redactPersonalNames } from "../shared/names.mjs"
import {
  createPlaceForRecord,
  defaultMaxAgeYears,
  isVisibleRecord,
  matchPublicRecords,
  publicRecordView,
  visibleRecords,
} from "./public-records.mjs"

const SESSION_MS = 30 * 24 * 60 * 60 * 1000
const RATE_LIMIT = 80
const RATE_WINDOW_MS = 10 * 60 * 1000

const STATIC_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".map": "application/json",
}

function accountKind(user) {
  return user?.kind === "store" ? "store" : "reader"
}

function publicUser(user) {
  return { id: user.id, email: user.email, kind: accountKind(user) }
}

function resolveChairPolicy({ chairEmail, production } = {}) {
  const raw = chairEmail !== undefined ? chairEmail : process.env.ITB_CHAIR_EMAIL
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  const locked =
    production !== undefined
      ? Boolean(production)
      : process.env.NODE_ENV === "production" || process.env.ITB_SECURE_COOKIE === "1"
  return { chairEmail: email || null, production: locked }
}

function chairView(data, user, policy) {
  const mine = Boolean(user && data.chairUserId === user.id)
  const reader = Boolean(user) && accountKind(user) !== "store"
  const allowed = policy.chairEmail
    ? user?.email?.toLowerCase() === policy.chairEmail
    : !policy.production
  return {
    claimed: Boolean(data.chairUserId),
    mine,
    canClaim: reader && allowed && (!data.chairUserId || mine),
    open: !policy.chairEmail && !policy.production,
  }
}

function isOnBoard(report) {
  return !report.retractedAt && !report.hiddenAt
}

function listedOnBoard(data, workplace, now, maxAgeYears) {
  if (!workplace.claimOnly) return true
  if (data.reports.some((report) => report.workplaceId === workplace.id && isOnBoard(report))) return true
  return visibleRecords(data, now, maxAgeYears).some((record) => record.workplaceId === workplace.id)
}

function ensureWorkplace(data, businessName) {
  const key = businessName.toLowerCase()
  const existing = data.workplaces.find((item) => item.name.toLowerCase() === key)
  if (existing) return existing
  let slug = slugify(businessName)
  let n = 2
  while (data.workplaces.some((item) => item.slug === slug)) {
    slug = `${slugify(businessName)}-${n}`
    n += 1
  }
  const workplace = {
    id: randomId("wp"),
    slug,
    name: businessName,
    industry: null,
    city: "",
    region: "",
    street: "",
    zip: "",
    createdAt: new Date().toISOString(),
    claimOnly: true,
  }
  data.workplaces.push(workplace)
  return workplace
}

function verifiedClaimsForName(data, businessName, exceptId) {
  const key = businessName.trim().toLowerCase()
  return data.storeClaims.filter(
    (item) =>
      item.status === "approved" &&
      item.id !== exceptId &&
      item.businessName.trim().toLowerCase() === key,
  )
}

function chairClaimView(data, claim) {
  const account = data.users.find((user) => user.id === claim.userId)
  const workplace = claim.workplaceId
    ? data.workplaces.find((item) => item.id === claim.workplaceId)
    : null
  return {
    id: claim.id,
    businessName: claim.businessName,
    role: claim.role,
    workEmail: claim.workEmail,
    accountEmail: account?.email ?? null,
    freeInbox: Boolean(claim.freeInbox),
    status: claim.status,
    createdAt: claim.createdAt,
    decidedAt: claim.decidedAt ?? null,
    verifiedCount: verifiedClaimsForName(data, claim.businessName, claim.id).length,
    workplaceName: workplace?.name ?? null,
  }
}

function storeClaimView(claim) {
  return {
    id: claim.id,
    businessName: claim.businessName,
    role: claim.role,
    workEmail: claim.workEmail,
    freeInbox: Boolean(claim.freeInbox),
    status: claim.status,
    createdAt: claim.createdAt,
  }
}

function activeStoreClaim(data, userId) {
  const mine = data.storeClaims.filter((claim) => claim.userId === userId)
  return (
    mine.find((claim) => claim.status === "pending") ??
    mine.find((claim) => claim.status === "approved") ??
    mine[mine.length - 1] ??
    null
  )
}

function roomsForWorkplace(data, workplaceId) {
  const scores = new Map()
  for (const report of data.reports) {
    if (!isOnBoard(report) || report.workplaceId !== workplaceId) continue
    const list = scores.get(report.roomKind) ?? []
    list.push(report.score)
    scores.set(report.roomKind, list)
  }
  return [...scores.entries()]
    .map(([kind, list]) => ({
      kind,
      score: Math.round((list.reduce((sum, value) => sum + value, 0) / list.length) * 10) / 10,
    }))
    .sort((a, b) => compareRooms(a.kind, b.kind))
}

function publicWorkplace(data, workplace) {
  return {
    id: workplace.id,
    slug: workplace.slug,
    name: workplace.name,
    industry: workplace.industry,
    city: workplace.city,
    region: workplace.region,
    blurb: "",
    street: workplace.street ?? "",
    zip: workplace.zip ?? "",
    rooms: roomsForWorkplace(data, workplace.id),
    listedPlan: "free",
    demo: false,
  }
}

function publicReport(report) {
  return {
    id: report.id,
    workplaceSlug: report.workplaceSlug,
    workplaceName: report.workplaceName,
    workplaceCity: report.workplaceCity,
    workplaceRegion: report.workplaceRegion,
    workplaceIndustry: report.workplaceIndustry,
    roomKind: report.roomKind,
    score: report.score,
    context: report.context,
    excerpt: report.excerpt,
    publishedAt: report.publishedAt,
    disputed: false,
  }
}

function ownerReport(report) {
  return {
    ...publicReport(report),
    retracted: Boolean(report.retractedAt),
    hidden: Boolean(report.hiddenAt),
  }
}

export function createApp({
  storePath,
  staticRoot = null,
  rateLimitEnabled = process.env.ITB_DISABLE_RATELIMIT !== "1",
  trustProxy = process.env.ITB_TRUST_PROXY ?? "",
  rateLimitMax = RATE_LIMIT,
  chairEmail,
  production,
  recordMaxAgeYears,
}) {
  const maxAgeYears = defaultMaxAgeYears(recordMaxAgeYears)
  const chairPolicy = resolveChairPolicy({ chairEmail, production })
  if (chairPolicy.production && !chairPolicy.chairEmail) {
    console.warn("ITB_CHAIR_EMAIL is unset. Nobody can claim the platform chair.")
  }
  const store = createStore(storePath)
  const hits = new Map()

  function rateLimit(req) {
    if (!rateLimitEnabled) return true
    const now = Date.now()
    const ip = clientAddress(req, { ITB_TRUST_PROXY: trustProxy })
    const bucket = (hits.get(ip) ?? []).filter((stamp) => now - stamp < RATE_WINDOW_MS)
    if (bucket.length >= rateLimitMax) {
      hits.set(ip, bucket)
      return false
    }
    bucket.push(now)
    hits.set(ip, bucket)
    return true
  }

  function send(res, status, body, headers = {}) {
    const payload = JSON.stringify(body)
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    })
    res.end(payload)
  }

  function readCookie(req) {
    const raw = req.headers.cookie ?? ""
    for (const part of raw.split(";")) {
      const [key, ...rest] = part.trim().split("=")
      if (key === "itb_session") return decodeURIComponent(rest.join("="))
    }
    return ""
  }

  function sessionCookie(token) {
    const parts = [
      `itb_session=${token ? encodeURIComponent(token) : ""}`,
      "HttpOnly",
      "SameSite=Lax",
      "Path=/",
      `Max-Age=${token ? Math.floor(SESSION_MS / 1000) : 0}`,
    ]
    if (process.env.ITB_SECURE_COOKIE === "1") parts.push("Secure")
    return parts.join("; ")
  }

  function userFrom(data, token) {
    if (!token) return null
    const tokenHash = sha256(token)
    const now = Date.now()
    const session = data.sessions.find(
      (item) => item.tokenHash === tokenHash && Date.parse(item.expiresAt) > now,
    )
    if (!session) return null
    return data.users.find((user) => user.id === session.userId) ?? null
  }

  function originAllowed(req) {
    const origin = req.headers.origin
    if (!origin) return true
    let url
    try {
      url = new URL(origin)
    } catch {
      return false
    }
    if (url.host === req.headers.host) return true
    const extra = (process.env.ITB_ORIGINS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    return extra.includes(origin)
  }

  async function readJson(req) {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 20_000) {
        const error = new Error("That filing is too large.")
        error.status = 413
        throw error
      }
      chunks.push(chunk)
    }
    if (size === 0) return {}
    const text = Buffer.concat(chunks).toString("utf8")
    try {
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        const error = new Error("Send a JSON object.")
        error.status = 400
        throw error
      }
      return parsed
    } catch (error) {
      if (error.status) throw error
      const invalid = new Error("Send JSON.")
      invalid.status = 400
      throw invalid
    }
  }

  function requireJson(req) {
    const type = req.headers["content-type"] ?? ""
    if (!type.includes("application/json")) {
      const error = new Error("Send JSON.")
      error.status = 415
      throw error
    }
  }

  async function serveStatic(req, res, url) {
    if (!staticRoot || req.method !== "GET" && req.method !== "HEAD") return false
    const root = path.resolve(staticRoot)
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith("/")) pathname += "index.html"
    const file = path.resolve(root, `.${pathname}`)
    const inside = file === root || file.startsWith(`${root}${path.sep}`)
    if (!inside) {
      send(res, 403, { error: "Forbidden" })
      return true
    }
    try {
      const info = await stat(file)
      if (!info.isFile()) throw new Error("not a file")
      const type = STATIC_TYPES[path.extname(file)] ?? "application/octet-stream"
      res.writeHead(200, { "content-type": type, "x-content-type-options": "nosniff" })
      if (req.method === "HEAD") {
        res.end()
        return true
      }
      createReadStream(file).pipe(res)
      return true
    } catch {
      const index = path.join(root, "index.html")
      try {
        await stat(index)
      } catch {
        return false
      }
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
      })
      if (req.method === "HEAD") res.end()
      else createReadStream(index).pipe(res)
      return true
    }
  }

  async function handle(req, res) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1")
    const { pathname } = url

    if (pathname === "/api/health" && req.method === "GET") {
      send(res, 200, { ok: true })
      return
    }

    if (pathname.startsWith("/api/") && !originAllowed(req)) {
      send(res, 403, { error: "That request came from somewhere else." })
      return
    }

    try {
      if (pathname === "/api/board" && req.method === "GET") {
        const data = await store.read()
        const now = new Date()
        send(res, 200, {
          workplaces: data.workplaces
            .filter((workplace) => listedOnBoard(data, workplace, now, maxAgeYears))
            .map((workplace) => publicWorkplace(data, workplace)),
          reports: data.reports.filter((report) => isOnBoard(report)).map(publicReport),
          publicRecords: visibleRecords(data, now, maxAgeYears).map((record) => publicRecordView(data, record)),
        })
        return
      }

      if (pathname === "/api/auth/me" && req.method === "GET") {
        const data = await store.read()
        const user = userFrom(data, readCookie(req))
        send(res, 200, { user: user ? publicUser(user) : null, chair: chairView(data, user, chairPolicy) })
        return
      }

      if (pathname === "/api/chair/reports" && req.method === "GET") {
        await listChairReports(req, res)
        return
      }

      if (pathname === "/api/chair/store-claims" && req.method === "GET") {
        await listStoreClaims(req, res)
        return
      }

      if (pathname === "/api/chair/public-records" && req.method === "GET") {
        await listPublicRecords(req, res)
        return
      }

      if (pathname === "/api/chair/record-errors" && req.method === "GET") {
        await listRecordErrors(req, res)
        return
      }

      if (pathname === "/api/store/home" && req.method === "GET") {
        await storeHome(req, res)
        return
      }

      if (pathname === "/api/me/reports" && req.method === "GET") {
        const data = await store.read()
        const user = userFrom(data, readCookie(req))
        if (!user) {
          send(res, 401, { error: "Sign in to see files tied to your account." })
          return
        }
        const reports = data.reports
          .filter((report) => report.ownerUserId === user.id)
          .map(ownerReport)
        send(res, 200, { reports })
        return
      }

      if (req.method === "DELETE" && pathname.startsWith("/api/reports")) {
        send(res, 405, {
          error: "A report cannot be deleted. The person who filed it can retract it.",
        })
        return
      }

      if (req.method === "POST" && /\/resolve$/.test(pathname)) {
        send(res, 404, { error: "There is no resolve action." })
        return
      }

      if (!pathname.startsWith("/api/")) {
        const served = await serveStatic(req, res, url)
        if (!served) send(res, 404, { error: "Not found" })
        return
      }

      if (req.method !== "POST") {
        send(res, 404, { error: "Not found" })
        return
      }

      if (!rateLimit(req)) {
        req.resume()
        send(res, 429, { error: "Too many attempts. Wait a few minutes." })
        return
      }

      requireJson(req)
      const body = await readJson(req)

      if (pathname === "/api/auth/register") {
        await register(req, res, body)
        return
      }
      if (pathname === "/api/auth/login") {
        await login(req, res, body)
        return
      }
      if (pathname === "/api/auth/logout") {
        await logout(req, res)
        return
      }
      if (pathname === "/api/auth/delete") {
        await deleteAccount(req, res, body)
        return
      }
      if (pathname === "/api/chair/claim") {
        await claimChair(req, res)
        return
      }
      if (pathname === "/api/reports") {
        await fileReport(req, res, body)
        return
      }
      if (pathname === "/api/reports/retract") {
        await retractWithReceipt(body, res)
        return
      }
      if (pathname === "/api/me/reports/retract") {
        await retractOwn(req, res, body)
        return
      }
      if (pathname === "/api/chair/reports/hide") {
        await setReportHidden(req, res, body, true)
        return
      }
      if (pathname === "/api/chair/reports/unhide") {
        await setReportHidden(req, res, body, false)
        return
      }
      if (pathname === "/api/store/claims") {
        await submitStoreClaim(req, res, body)
        return
      }
      if (pathname === "/api/chair/store-claims/approve") {
        await decideStoreClaim(req, res, body, "approved")
        return
      }
      if (pathname === "/api/chair/store-claims/refuse") {
        await decideStoreClaim(req, res, body, "refused")
        return
      }
      if (pathname === "/api/public-records/error") {
        await reportRecordError(req, res, body)
        return
      }
      if (pathname === "/api/chair/public-records/link") {
        await linkPublicRecord(req, res, body)
        return
      }
      if (pathname === "/api/chair/public-records/place") {
        await placePublicRecord(req, res, body)
        return
      }
      if (pathname === "/api/chair/record-errors/close") {
        await closeRecordError(req, res, body)
        return
      }

      send(res, 404, { error: "Not found" })
    } catch (error) {
      const status = error.status || 500
      const message = status === 500 ? "The board hit an error." : error.message
      if (status === 500) console.error(error)
      send(res, status, { error: message })
    }
  }

  async function register(_req, res, body) {
    const email = parseEmail(body.email)
    if (!email) {
      send(res, 400, { error: "Enter a real email." })
      return
    }
    const password = parsePassword(body.password)
    if (password.error) {
      send(res, 400, { error: password.error })
      return
    }
    const passwordHash = hashPassword(password.password)
    const result = await store.update((data) => {
      if (data.users.some((user) => user.email === email)) {
        return { status: 409, error: "An account with that email already exists. Sign in instead." }
      }
      const user = {
        id: randomId("usr"),
        email,
        passwordHash,
        kind: body.kind === "store" ? "store" : "reader",
        createdAt: new Date().toISOString(),
      }
      const token = randomToken()
      data.users.push(user)
      data.sessions.push({
        id: randomId("ses"),
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + SESSION_MS).toISOString(),
      })
      return { status: 201, token, user: publicUser(user), chair: chairView(data, user, chairPolicy) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(
      res,
      result.status,
      { user: result.user, chair: result.chair },
      { "set-cookie": sessionCookie(result.token) },
    )
  }

  async function login(_req, res, body) {
    const email = parseEmail(body.email)
    const password = typeof body.password === "string" ? body.password : ""
    if (!email || !password) {
      send(res, 401, { error: "Email or password is wrong." })
      return
    }
    const snapshot = await store.read()
    const existing = snapshot.users.find((user) => user.email === email)
    const valid = existing ? verifyPassword(password, existing.passwordHash) : false
    if (!existing || !valid) {
      send(res, 401, { error: "Email or password is wrong." })
      return
    }
    const requested = body.kind === "store" ? "store" : body.kind === "reader" ? "reader" : null
    if (requested && requested !== accountKind(existing)) {
      const error =
        requested === "store"
          ? "That email is a reader account. Store sign-in is separate."
          : "That email is a store account. Sign in under For stores."
      send(res, 401, { error })
      return
    }
    const token = randomToken()
    const result = await store.update((data) => {
      const user = data.users.find((item) => item.id === existing.id)
      if (!user) return { status: 401, error: "Email or password is wrong." }
      data.sessions = data.sessions.filter((session) => Date.parse(session.expiresAt) > Date.now())
      data.sessions.push({
        id: randomId("ses"),
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + SESSION_MS).toISOString(),
      })
      return { status: 200, user: publicUser(user), chair: chairView(data, user, chairPolicy) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { user: result.user, chair: result.chair }, { "set-cookie": sessionCookie(token) })
  }

  async function logout(req, res) {
    const token = readCookie(req)
    if (token) {
      const tokenHash = sha256(token)
      await store.update((data) => {
        data.sessions = data.sessions.filter((session) => session.tokenHash !== tokenHash)
        return null
      })
    }
    send(res, 200, { ok: true }, { "set-cookie": sessionCookie("") })
  }

  async function deleteAccount(req, res, body) {
    const email = parseEmail(body.email)
    const password = typeof body.password === "string" ? body.password : ""
    const snapshot = await store.read()
    const existing = email ? snapshot.users.find((user) => user.email === email) : null
    const valid = existing ? verifyPassword(password, existing.passwordHash) : false
    if (!existing || !valid) {
      send(res, 401, { error: "Email or password is wrong." })
      return
    }
    const result = await store.update((data) => {
      const user = data.users.find((item) => item.id === existing.id)
      if (!user) return { status: 401, error: "Email or password is wrong." }
      if (data.chairUserId === user.id) {
        return {
          status: 403,
          error: "The moderator account cannot be deleted.",
        }
      }
      data.users = data.users.filter((item) => item.id !== user.id)
      data.sessions = data.sessions.filter((session) => session.userId !== user.id)
      data.storeClaims = data.storeClaims.filter((claim) => claim.userId !== user.id)
      for (const report of data.reports) {
        if (report.ownerUserId === user.id) report.ownerUserId = null
      }
      return { status: 200 }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { deleted: true }, { "set-cookie": sessionCookie("") })
  }

  async function claimChair(req, res) {
    const token = readCookie(req)
    const result = await store.update((data) => {
      const user = userFrom(data, token)
      if (!user) return { status: 401, error: "Sign in before claiming the chair." }
      if (chairPolicy.chairEmail) {
        if (accountKind(user) === "store" || user.email.toLowerCase() !== chairPolicy.chairEmail) {
          return { status: 404, error: "Not found." }
        }
      } else if (chairPolicy.production) {
        return { status: 403, error: "Not found." }
      } else if (accountKind(user) === "store") {
        return { status: 403, error: "A store account cannot claim the platform chair." }
      }
      if (!data.chairUserId) {
        data.chairUserId = user.id
        data.chairClaimedAt = new Date().toISOString()
        return { status: 200, chair: chairView(data, user, chairPolicy) }
      }
      if (data.chairUserId === user.id) return { status: 200, chair: chairView(data, user, chairPolicy) }
      return { status: 409, error: "The platform chair is already claimed." }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, result.status, { chair: result.chair })
  }

  async function fileReport(req, res, body) {
    const parsed = parseFiling(body)
    if (parsed.error) {
      send(res, 400, { error: parsed.error })
      return
    }
    const filing = parsed.value
    const token = readCookie(req)
    const receipt = randomReceipt()
    const receiptHash = sha256(normalizeReceipt(receipt))
    const result = await store.update((data) => {
      const user = userFrom(data, token)
      let workplace = null
      if (!filing.create) {
        workplace = data.workplaces.find((item) => item.slug === filing.workplaceSlug) ?? null
      }
      if (filing.create) {
        workplace =
          data.workplaces.find(
            (item) => item.name.toLowerCase() === filing.workplaceName.toLowerCase(),
          ) ?? null
        if (!workplace) {
          let slug = slugify(filing.workplaceName)
          let n = 2
          while (data.workplaces.some((item) => item.slug === slug)) {
            slug = `${slugify(filing.workplaceName)}-${n}`
            n += 1
          }
          workplace = {
            id: randomId("wp"),
            slug,
            name: filing.workplaceName,
            industry: filing.industry,
            city: filing.city,
            region: filing.region,
            street: "",
            zip: "",
            createdAt: new Date().toISOString(),
          }
          data.workplaces.push(workplace)
        }
      }
      if (workplace && filing.create) {
        if (!workplace.city) workplace.city = filing.city
        if (!workplace.region) workplace.region = filing.region
        if (!workplace.industry) workplace.industry = filing.industry
      }
      const report = {
        id: randomId("rpt"),
        workplaceId: workplace?.id ?? null,
        workplaceSlug: workplace?.slug ?? filing.workplaceSlug,
        workplaceName: workplace?.name ?? filing.workplaceName,
        workplaceCity: workplace?.city ?? filing.city,
        workplaceRegion: workplace?.region ?? filing.region,
        workplaceIndustry: workplace?.industry ?? filing.industry,
        roomKind: filing.roomKind,
        score: filing.score,
        context: filing.context,
        excerpt: filing.excerpt,
        publishedAt: new Date().toISOString(),
        retractedAt: null,
        hiddenAt: null,
        receiptHash,
        ownerUserId: user?.id ?? null,
      }
      data.reports.push(report)
      return {
        report: publicReport(report),
        workplace: workplace ? publicWorkplace(data, workplace) : null,
      }
    })
    send(res, 201, { report: result.report, receipt, workplace: result.workplace })
  }

  async function retractWithReceipt(body, res) {
    const receipt = normalizeReceipt(body.receipt)
    if (receipt.length < 8) {
      send(res, 400, { error: "That receipt does not match a filed report." })
      return
    }
    const receiptHash = sha256(receipt)
    const result = await store.update((data) => {
      let found = null
      for (const report of data.reports) {
        if (safeEqualHex(receiptHash, report.receiptHash)) found = report
      }
      if (!found) return { status: 400, error: "That receipt does not match a filed report." }
      if (!found.retractedAt) found.retractedAt = new Date().toISOString()
      return { status: 200, retracted: true }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { retracted: true })
  }

  async function listChairReports(req, res) {
    const data = await store.read()
    const user = userFrom(data, readCookie(req))
    if (!user) {
      send(res, 401, { error: "Sign in as the platform chair." })
      return
    }
    if (data.chairUserId !== user.id) {
      send(res, 403, { error: "Only the platform chair can open this queue." })
      return
    }
    const reports = data.reports
      .filter((report) => !report.retractedAt)
      .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
      .map((report) => ({ ...publicReport(report), hidden: Boolean(report.hiddenAt) }))
    send(res, 200, { reports })
  }

  async function setReportHidden(req, res, body, hidden) {
    const reportId = typeof body.reportId === "string" ? body.reportId : ""
    if (!reportId) {
      send(res, 400, { error: "Name the filing." })
      return
    }
    const token = readCookie(req)
    const result = await store.update((data) => {
      const user = userFrom(data, token)
      if (!user) return { status: 401, error: "Sign in as the platform chair." }
      if (data.chairUserId !== user.id) {
        return { status: 403, error: "Only the platform chair can hide or unhide a filing." }
      }
      const report = data.reports.find((item) => item.id === reportId)
      if (!report) return { status: 404, error: "That report is not in the queue." }
      if (hidden) {
        if (!report.hiddenAt) report.hiddenAt = new Date().toISOString()
      } else {
        report.hiddenAt = null
      }
      return { status: 200, hidden: Boolean(report.hiddenAt) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { hidden: result.hidden })
  }

  async function retractOwn(req, res, body) {
    const token = readCookie(req)
    const reportId = typeof body.reportId === "string" ? body.reportId : ""
    const result = await store.update((data) => {
      const user = userFrom(data, token)
      if (!user) return { status: 401, error: "Sign in to retract a file tied to your account." }
      const report = data.reports.find((item) => item.id === reportId && item.ownerUserId === user.id)
      if (!report) return { status: 404, error: "No file under this account matches that id." }
      if (!report.retractedAt) report.retractedAt = new Date().toISOString()
      return { status: 200, retracted: true }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { retracted: true })
  }

  function requireChair(data, token) {
    const user = userFrom(data, token)
    if (!user) return { error: { status: 401, error: "Sign in as the platform chair." } }
    if (data.chairUserId !== user.id) {
      return { error: { status: 403, error: "Only the platform chair can open this queue." } }
    }
    return { user }
  }

  async function listStoreClaims(req, res) {
    const data = await store.read()
    const gate = requireChair(data, readCookie(req))
    if (gate.error) {
      send(res, gate.error.status, { error: gate.error.error })
      return
    }
    const claims = [...data.storeClaims]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((claim) => chairClaimView(data, claim))
    send(res, 200, { claims })
  }

  async function storeHome(req, res) {
    const data = await store.read()
    const user = userFrom(data, readCookie(req))
    if (!user || accountKind(user) !== "store") {
      send(res, 401, { error: "Sign in with a store account." })
      return
    }
    const claim = activeStoreClaim(data, user.id)
    const stores = []
    if (claim?.status === "approved" && claim.workplaceId) {
      const workplace = data.workplaces.find((item) => item.id === claim.workplaceId)
      if (workplace) {
        stores.push({
          workplace: publicWorkplace(data, workplace),
          reports: data.reports
            .filter((report) => report.workplaceId === workplace.id && isOnBoard(report))
            .map(publicReport),
          publicRecords: visibleRecords(data, new Date(), maxAgeYears)
            .filter((record) => record.workplaceId === workplace.id)
            .map((record) => publicRecordView(data, record)),
        })
      }
    }
    send(res, 200, { claim: claim ? storeClaimView(claim) : null, stores })
  }

  async function listPublicRecords(req, res) {
    const data = await store.read()
    const gate = requireChair(data, readCookie(req))
    if (gate.error) {
      send(res, gate.error.status, { error: gate.error.error })
      return
    }
    const now = new Date()
    const records = (data.publicRecords ?? [])
      .filter((record) => !record.workplaceId && isVisibleRecord(record, now, maxAgeYears))
      .map((record) => publicRecordView(data, record))
    const workplaces = data.workplaces.map((workplace) => ({
      id: workplace.id,
      name: workplace.name,
      city: workplace.city,
      street: workplace.street ?? "",
    }))
    send(res, 200, { records, workplaces })
  }

  async function listRecordErrors(req, res) {
    const data = await store.read()
    const gate = requireChair(data, readCookie(req))
    if (gate.error) {
      send(res, gate.error.status, { error: gate.error.error })
      return
    }
    const errors = (data.recordErrors ?? [])
      .filter((item) => !item.closedAt)
      .map((item) => {
        const record = data.publicRecords.find((row) => row.id === item.recordId)
        return {
          id: item.id,
          note: item.note,
          createdAt: item.createdAt,
          record: record ? publicRecordView(data, record) : null,
        }
      })
    send(res, 200, { errors })
  }

  async function reportRecordError(_req, res, body) {
    const recordId = typeof body.recordId === "string" ? body.recordId : ""
    const note = redactPersonalNames(typeof body.note === "string" ? body.note : "").slice(0, 500)
    if (!note) {
      send(res, 400, { error: "Write what looks wrong. Leave names out." })
      return
    }
    const result = await store.update((data) => {
      const record = (data.publicRecords ?? []).find((item) => item.id === recordId)
      if (!record || !isVisibleRecord(record, new Date(), maxAgeYears)) {
        return { status: 404, error: "Not found." }
      }
      if (!Array.isArray(data.recordErrors)) data.recordErrors = []
      data.recordErrors.push({
        id: randomId("err"),
        recordId: record.id,
        note,
        createdAt: new Date().toISOString(),
        closedAt: null,
      })
      return { status: 200 }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { sent: true })
  }

  async function linkPublicRecord(req, res, body) {
    const result = await store.update((data) => {
      const gate = requireChair(data, readCookie(req))
      if (gate.error) return gate.error
      const record = (data.publicRecords ?? []).find((item) => item.id === body.id)
      const workplace = data.workplaces.find((item) => item.id === body.workplaceId)
      if (!record || !workplace) return { status: 404, error: "Not found." }
      record.workplaceId = workplace.id
      if (!workplace.street && record.street) workplace.street = record.street
      if (!workplace.zip && record.zip) workplace.zip = record.zip
      if (!workplace.city && record.city) workplace.city = record.city
      matchPublicRecords(data)
      return { status: 200, record: publicRecordView(data, record) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { record: result.record })
  }

  async function placePublicRecord(req, res, body) {
    const result = await store.update((data) => {
      const gate = requireChair(data, readCookie(req))
      if (gate.error) return gate.error
      const record = (data.publicRecords ?? []).find((item) => item.id === body.id)
      if (!record) return { status: 404, error: "Not found." }
      const placed = createPlaceForRecord(data, record)
      if (placed.error) return { status: 409, error: placed.error }
      return { status: 200, record: publicRecordView(data, record), created: placed.created }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { record: result.record, created: result.created })
  }

  async function closeRecordError(req, res, body) {
    const result = await store.update((data) => {
      const gate = requireChair(data, readCookie(req))
      if (gate.error) return gate.error
      const item = (data.recordErrors ?? []).find((row) => row.id === body.id)
      if (!item) return { status: 404, error: "Not found." }
      item.closedAt = new Date().toISOString()
      return { status: 200 }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { closed: true })
  }

  async function submitStoreClaim(req, res, body) {
    const parsed = parseStoreClaim(body)
    if (parsed.error) {
      send(res, 400, { error: parsed.error })
      return
    }
    const token = readCookie(req)
    const result = await store.update((data) => {
      const user = userFrom(data, token)
      if (!user || accountKind(user) !== "store") {
        return { status: 401, error: "Sign in with a store account to claim a store." }
      }
      if (data.storeClaims.some((claim) => claim.userId === user.id && claim.status === "pending")) {
        return { status: 409, error: "You already have a claim waiting for a moderator." }
      }
      if (data.storeClaims.some((claim) => claim.userId === user.id && claim.status === "approved")) {
        return { status: 409, error: "This account is already verified for a store." }
      }
      const claim = {
        id: randomId("clm"),
        userId: user.id,
        ...parsed.value,
        status: "pending",
        workplaceId: null,
        createdAt: new Date().toISOString(),
        decidedAt: null,
      }
      data.storeClaims.push(claim)
      return { status: 201, claim: storeClaimView(claim) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, result.status, { claim: result.claim })
  }

  async function decideStoreClaim(req, res, body, nextStatus) {
    const claimId = typeof body.claimId === "string" ? body.claimId : ""
    if (!claimId) {
      send(res, 400, { error: "Name the claim." })
      return
    }
    const allowAnother = body.allowAnother === true
    const token = readCookie(req)
    const result = await store.update((data) => {
      const gate = requireChair(data, token)
      if (gate.error) return gate.error
      const claim = data.storeClaims.find((item) => item.id === claimId)
      if (!claim) return { status: 404, error: "No store claim matches that id." }
      if (nextStatus === "refused") {
        if (claim.status === "approved") {
          return { status: 409, error: "That claim is already verified. It stays on the store." }
        }
        claim.status = "refused"
        claim.decidedAt = new Date().toISOString()
        return { status: 200, claim: chairClaimView(data, claim) }
      }
      if (claim.status === "refused") {
        return { status: 409, error: "That claim was refused. The store can send a new one." }
      }
      const others = verifiedClaimsForName(data, claim.businessName, claim.id)
      if (others.length > 0 && !allowAnother) {
        return {
          status: 409,
          error: "This store already has a verified claim. Confirm to add another.",
        }
      }
      const workplace = ensureWorkplace(data, claim.businessName)
      if (claim.status !== "approved") claim.decidedAt = new Date().toISOString()
      claim.status = "approved"
      claim.workplaceId = workplace.id
      return { status: 200, claim: chairClaimView(data, claim) }
    })
    if (result.error) {
      send(res, result.status, { error: result.error })
      return
    }
    send(res, 200, { claim: result.claim })
  }

  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error(error)
      if (!res.headersSent) send(res, 500, { error: "The board hit an error." })
    })
  })

  return { server, store, roomKinds: ROOM_KINDS, industries: INDUSTRIES }
}
