import type { MouseEvent, ReactNode } from "react"
import { Menu } from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"
import { DemoBanner } from "@/components/layout/DemoBanner"
import { DocumentTitle } from "@/components/layout/DocumentTitle"
import { RouteErrorBoundary } from "@/components/layout/RouteErrorBoundary"
import { Wordmark } from "@/components/layout/Wordmark"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, focusRingClass } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
export type SiteNavItem = {
  to: string
  label: string
  end?: boolean
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
    focusRingClass,
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
  )
}

function sheetNavClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex min-h-11 items-center rounded-md px-3 text-base transition-colors",
    focusRingClass,
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
  )
}

const skipLinkClass = cn(
  "sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-[max(0.75rem,env(safe-area-inset-top))] focus-visible:left-[max(1rem,env(safe-area-inset-left))] focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:text-primary-foreground",
  focusRingClass,
)

export function SiteFrame({
  nav,
  headerExtra,
  footer,
  notice,
  children,
}: {
  nav: SiteNavItem[]
  headerExtra?: ReactNode
  footer: ReactNode
  notice?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const main = document.getElementById("main-content")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    main?.focus()
    main?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main-content" className={skipLinkClass} onClick={skipToContent}>
        Skip to content
      </a>
      <div className="sticky top-0 z-40 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <DemoBanner />
        <header className="border-b border-border/80">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
            <Wordmark />
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end ?? item.to === "/"} className={navClass}>
                  {item.label}
                </NavLink>
              ))}
              {headerExtra}
            </nav>
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost" aria-label="Open menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-72 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]"
                >
                  <SheetHeader>
                    <SheetTitle>In the Back</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Primary">
                    {nav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end ?? item.to === "/"}
                        className={sheetNavClass}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    {headerExtra ? <div className="px-3 pt-2">{headerExtra}</div> : null}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:py-8">
        <DocumentTitle />
        <RouteErrorBoundary>{children}</RouteErrorBoundary>
      </main>
      <footer className="border-t border-border/80 bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:py-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-2">
            <Wordmark compact />
            <p>
              Anonymous room-level back-of-house board. Public sees rooms, scores, context, and
              writing — never who wrote it. Not a résumé site.
            </p>
          </div>
          {footer}
        </div>
        {notice ? (
          <>
            <Separator />
            <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">{notice}</div>
          </>
        ) : null}
      </footer>
    </div>
  )
}
