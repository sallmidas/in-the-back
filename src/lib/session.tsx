import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { getMe, type AccountUser, type ChairState } from "@/lib/api"

type SessionValue = {
  ready: boolean
  user: AccountUser | null
  chair: ChairState
  refresh: () => Promise<void>
}

const EMPTY_CHAIR: ChairState = { claimed: false, mine: false, canClaim: false, open: false }

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<AccountUser | null>(null)
  const [chair, setChair] = useState<ChairState>(EMPTY_CHAIR)

  const refresh = useCallback(async () => {
    try {
      const me = await getMe()
      setUser(me.user)
      setChair(me.chair)
    } catch {
      setUser(null)
      setChair(EMPTY_CHAIR)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ ready, user, chair, refresh }),
    [ready, user, chair, refresh],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used inside SessionProvider")
  return value
}
