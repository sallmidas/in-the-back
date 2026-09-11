const KEY = "itb.staff.v1"

export type StaffSession = {
  email: string
  claimedSlug: string | null
  signedInAt: string
}

function read(): StaffSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StaffSession
    if (!parsed.email) return null
    return parsed
  } catch {
    return null
  }
}

function write(session: StaffSession | null) {
  if (!session) {
    localStorage.removeItem(KEY)
    return
  }
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function getStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null
  return read()
}

export function signInStaff(email: string): StaffSession {
  const session: StaffSession = {
    email: email.trim().toLowerCase(),
    claimedSlug: read()?.claimedSlug ?? null,
    signedInAt: new Date().toISOString(),
  }
  write(session)
  return session
}

export function signOutStaff() {
  write(null)
}

export function claimQueue(slug: string): StaffSession | null {
  const current = read()
  if (!current) return null
  const next = { ...current, claimedSlug: slug }
  write(next)
  return next
}

export function releaseQueue(): StaffSession | null {
  const current = read()
  if (!current) return null
  const next = { ...current, claimedSlug: null }
  write(next)
  return next
}
