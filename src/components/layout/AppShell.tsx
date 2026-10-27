import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { HoldNotice } from "@/components/layout/HoldNotice"
import { SiteFrame, type SiteNavItem } from "@/components/layout/SiteFrame"
import { useDemoRoomPath } from "@/lib/demo-room"
import { useSession } from "@/lib/session"
import { cn, focusRingClass } from "@/lib/utils"

const REPORTER_NAV: SiteNavItem[] = [
  { to: "/", label: "Board", end: true },
  { to: "/workplaces", label: "Directory" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/write", label: "File a report" },
]

const CHAIR_NAV: SiteNavItem = { to: "/staff", label: "Chair" }

const footerLinkClass = cn(
  "inline-flex min-h-11 items-center rounded-md px-1 py-1 hover:text-foreground",
  focusRingClass,
)

export function AppShell({ children }: { children: ReactNode }) {
  const demoPath = useDemoRoomPath()
  const { chair } = useSession()
  const nav = [
    ...REPORTER_NAV.slice(0, 3),
    ...(chair.mine ? [CHAIR_NAV] : []),
    ...REPORTER_NAV.slice(3),
    ...(demoPath ? [{ to: demoPath, label: "Open demo" }] : []),
  ]

  return (
    <SiteFrame
      nav={nav}
      blurb="Anonymous room-level board. Read a room, or file about one: cleanliness, safety, dignity. Never a person’s name. Reading and filing are free."
      footer={
        <div className="space-y-3">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Footer">
            <Link to="/how-it-works" className={footerLinkClass}>
              How it works
            </Link>
            <Link to="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
            <Link to="/terms" className={footerLinkClass}>
              Terms
            </Link>
            <Link to="/content" className={footerLinkClass}>
              Content policy
            </Link>
            <Link to="/account/delete" className={footerLinkClass}>
              Delete account
            </Link>
            {chair.mine ? (
              <Link to="/staff" className={footerLinkClass}>
                Chair
              </Link>
            ) : null}
            <Link to="/write" className={footerLinkClass}>
              File a report
            </Link>
          </nav>
          <p className="text-xs">
            <Link
              to="/stores"
              className={cn("inline-flex min-h-11 items-center rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline", focusRingClass)}
            >
              Are you a store?
            </Link>
          </p>
        </div>
      }
      notice={<HoldNotice />}
    >
      {children}
    </SiteFrame>
  )
}
