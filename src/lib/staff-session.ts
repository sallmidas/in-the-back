const KEY = "itb.staff.v1"

export type StaffSession = {
  email: string
  /** Platform chair claimed once for In the Back — not a workplace listing. */
  claimed: boolean
  signedInAt: string
}

type StoredSession = {
  email?: string
  claimed?: boolean
  claimedSlug?: string | null
  signedInAt?: string
}

function normalize(parsed: StoredSession): StaffSession | null {
  if (!parsed.email) return null
  const claimed =
    typeof parsed.claimed === "boolean" ? parsed.claimed : Boolean(parsed.claimedSlug)
  return {
    email: parsed.email,
    claimed,
    signedInAt: parsed.signedInAt ?? new Date().toISOString(),
  }
}

function read(): StaffSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return normalize(JSON.parse(raw) as StoredSession)
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
    claimed: read()?.claimed ?? false,
    signedInAt: new Date().toISOString(),
  }
  write(session)
  return session
}

export function signOutStaff() {
  write(null)
}

export function claimQueue(): StaffSession | null {
  const current = read()
  if (!current) return null
  const next = { ...current, claimed: true }
  write(next)
  return next
}

export function releaseQueue(): StaffSession | null {
  const current = read()
  if (!current) return null
  const next = { ...current, claimed: false }
  write(next)
  return next
}
