import { Link } from "react-router-dom"
import { demoSeedEnabled } from "@/data/demo-flag"
import { cn, focusRingClass } from "@/lib/utils"

export function DemoBanner() {
  if (!demoSeedEnabled) return null

  return (
    <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-[13px] leading-snug text-primary sm:text-sm">
      <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Demo seed</span>
      <span className="mx-2 text-primary/40">/</span>
      Sample board only. These workplaces are labeled DEMO.{" "}
      <Link
        to="/#demo-walk"
        className={cn("rounded-sm underline-offset-4 hover:underline", focusRingClass)}
      >
        Walk the demo
      </Link>
    </div>
  )
}
