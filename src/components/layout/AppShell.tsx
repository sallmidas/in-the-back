import type { ReactNode } from "react"
import { Menu } from "lucide-react"
import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { DemoBanner } from "@/components/layout/DemoBanner"
import { Wordmark } from "@/components/layout/Wordmark"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const NAV = [
  { to: "/", label: "Board" },
  { to: "/workplaces", label: "Directory" },
  { to: "/plans", label: "Plans" },
  { to: "/staff", label: "Staff" },
]

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
  ].join(" ")
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col">
      <DemoBanner />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Wordmark />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            <Button asChild size="sm" className="ml-2">
              <Link to="/write">File a report</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Button asChild size="sm" variant="outline">
              <Link to="/write">File</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>In the Back</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1 px-4">
                  {NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      className={navClass}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-border/80 bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-2">
            <Wordmark compact />
            <p>
              Anonymous room-level BOH board. Public sees rooms, scores, context, and writing —
              never who wrote it. Not a résumé site.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/account/delete" className="hover:text-foreground">
              Delete account
            </Link>
            <Link to="/plans" className="hover:text-foreground">
              Plans
            </Link>
            <Link to="/staff" className="hover:text-foreground">
              Staff chair
            </Link>
          </div>
        </div>
        <Separator />
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          Form an LLC before Stripe or payouts. Pay-on-publish is the billing model — not
          implemented yet. Phase 1 is a seeded board plus stubs.
        </p>
      </footer>
    </div>
  )
}
