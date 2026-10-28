import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { SiteFrame, type SiteNavItem } from "@/components/layout/SiteFrame"
import { Button } from "@/components/ui/button"
import { logoutAccount } from "@/lib/api"
import { useSession } from "@/lib/session"
import { cn, focusRingClass } from "@/lib/utils"

const footerLinkClass = cn(
  "inline-flex min-h-11 items-center rounded-md px-1 py-1 hover:text-foreground",
  focusRingClass,
)

export function StoreShell({ children }: { children: ReactNode }) {
  const { user, chair, refresh } = useSession()
  const signedIn = user?.kind === "store"
  const nav: SiteNavItem[] = signedIn
    ? [
        { to: "/stores/dashboard", label: "Dashboard", end: true },
        { to: "/stores/plans", label: "Plans", end: true },
        ...(chair.mine ? [{ to: "/staff", label: "Chair" }] : []),
      ]
    : [
        { to: "/stores", label: "For stores", end: true },
        { to: "/stores/plans", label: "Plans", end: true },
        { to: "/stores/login", label: "Sign in", end: true },
        ...(chair.mine ? [{ to: "/staff", label: "Chair" }] : []),
      ]

  async function onSignOut() {
    await logoutAccount()
    await refresh()
  }

  return (
    <SiteFrame
      nav={nav}
      blurb="For stores. Claim the store, then see its rooms, scores, and anonymous reports. Alerts and a response are planned for later, and nothing is charged now."
      headerExtra={
        signedIn ? (
          <Button type="button" variant="outline" size="sm" className="w-full lg:ml-1 lg:w-auto" onClick={() => void onSignOut()}>
            Sign out
          </Button>
        ) : null
      }
      footer={
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Footer">
          <Link to="/" className={footerLinkClass}>
            Public board
          </Link>
          <Link to="/privacy" className={footerLinkClass}>
            Privacy
          </Link>
          <Link to="/terms" className={footerLinkClass}>
            Terms
          </Link>
          {chair.mine ? (
            <Link to="/staff" className={footerLinkClass}>
              Chair
            </Link>
          ) : null}
        </nav>
      }
      notice={<p>Store plans are a later model. Nothing is charged during this preview.</p>}
    >
      {children}
    </SiteFrame>
  )
}
