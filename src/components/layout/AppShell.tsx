import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { HoldNotice } from "@/components/layout/HoldNotice"
import { SiteFrame, type SiteNavItem } from "@/components/layout/SiteFrame"
import { useDemoRoomPath } from "@/lib/demo-room"
import { cn, focusRingClass } from "@/lib/utils"

const REPORTER_NAV: SiteNavItem[] = [
  { to: "/", label: "Board", end: true },
  { to: "/workplaces", label: "Directory" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/staff", label: "Chair" },
  { to: "/write", label: "File a report" },
]

const footerLinkClass = cn(
  "inline-flex min-h-11 items-center rounded-md px-1 py-1 hover:text-foreground",
  focusRingClass,
)

export function AppShell({ children }: { children: ReactNode }) {
  const demoPath = useDemoRoomPath()
  const nav = demoPath
    ? [...REPORTER_NAV, { to: demoPath, label: "Open demo" }]
    : REPORTER_NAV

  return (
    <SiteFrame
      nav={nav}
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
            <Link to="/staff" className={footerLinkClass}>
              Chair
            </Link>
            <Link to="/write" className={footerLinkClass}>
              File a report
            </Link>
          </nav>
          <p className="text-xs">
            <Link
              to="/stores"
              className={cn("rounded-sm text-muted-foreground/80 underline-offset-4 hover:text-foreground hover:underline", focusRingClass)}
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
