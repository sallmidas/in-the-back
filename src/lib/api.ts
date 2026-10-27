export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export type AccountUser = {
  id: string
  email: string
}

export type ChairState = {
  claimed: boolean
  mine: boolean
}

export type MeResponse = {
  user: AccountUser | null
  chair: ChairState
}

export type LiveReport = {
  id: string
  workplaceSlug: string
  workplaceName: string
  workplaceCity: string
  workplaceRegion: string
  workplaceIndustry: string | null
  roomKind: string
  score: number
  context: string
  excerpt: string
  publishedAt: string
  disputed: boolean
}

export type LiveWorkplace = {
  id: string
  slug: string
  name: string
  industry: string | null
  city: string
  region: string
  blurb: string
  rooms: { kind: string; score: number }[]
  listedPlan: "free"
  demo: false
}

export type BoardPayload = {
  workplaces: LiveWorkplace[]
  reports: LiveReport[]
}

export type OwnedReport = LiveReport & { retracted: boolean; hidden: boolean }

export type StaffReport = LiveReport & { hidden: boolean }

export type FilingInput = {
  create: boolean
  workplaceName: string
  workplaceSlug?: string
  city?: string
  region?: string
  industry?: string
  roomKind: string
  score: number
  context: string
  excerpt: string
  /** Self-attested. Required to file. Not stored or shown on the board. */
  inRoom: boolean
}

function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "")
  return `${base}${path}`
}

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: init?.method ?? "GET",
      credentials: "include",
      headers: init?.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
  } catch {
    throw new ApiError("The board couldn't be reached.", 0)
  }

  const text = await response.text()
  let data: { error?: string } | null = null
  try {
    data = text ? (JSON.parse(text) as { error?: string }) : null
  } catch {
    data = null
  }
  if (!response.ok) {
    throw new ApiError(data?.error || "The board couldn't be reached.", response.status)
  }
  return data as T
}

export function getBoard() {
  return request<BoardPayload>("/api/board")
}

export function getMe() {
  return request<MeResponse>("/api/auth/me")
}

export function registerAccount(email: string, password: string) {
  return request<MeResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password },
  })
}

export function loginAccount(email: string, password: string) {
  return request<MeResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  })
}

export function logoutAccount() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST", body: {} })
}

export function deleteAccount(email: string, password: string) {
  return request<{ deleted: boolean }>("/api/auth/delete", {
    method: "POST",
    body: { email, password },
  })
}

export function claimChair() {
  return request<{ chair: ChairState }>("/api/chair/claim", { method: "POST", body: {} })
}

export function chairReports() {
  return request<{ reports: StaffReport[] }>("/api/chair/reports")
}

export function hideReport(reportId: string) {
  return request<{ hidden: boolean }>("/api/chair/reports/hide", {
    method: "POST",
    body: { reportId },
  })
}

export function unhideReport(reportId: string) {
  return request<{ hidden: boolean }>("/api/chair/reports/unhide", {
    method: "POST",
    body: { reportId },
  })
}

export function fileReport(body: FilingInput) {
  return request<{ report: LiveReport; receipt: string; workplace: LiveWorkplace | null }>(
    "/api/reports",
    { method: "POST", body },
  )
}

export function retractWithReceipt(receipt: string) {
  return request<{ retracted: boolean }>("/api/reports/retract", {
    method: "POST",
    body: { receipt },
  })
}

export function myReports() {
  return request<{ reports: OwnedReport[] }>("/api/me/reports")
}

export function retractOwnReport(reportId: string) {
  return request<{ retracted: boolean }>("/api/me/reports/retract", {
    method: "POST",
    body: { reportId },
  })
}
