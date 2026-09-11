import { Link } from "react-router-dom"
import { isDemoSeedEnabled } from "@/data/demo-flag"

export function DemoBanner() {
  const seeded = isDemoSeedEnabled()

  return (
    <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-center text-sm text-primary">
      {seeded ? (
        <>
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Demo seed</span>
          <span className="mx-2 text-primary/40">/</span>
          Sample board only. Filing and billing held until LLC.{" "}
          <Link to="/#demo-walk" className="underline-offset-4 hover:underline">
            Walk the demo
          </Link>
        </>
      ) : (
        <>
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
            Launch catalog
          </span>
          <span className="mx-2 text-primary/40">/</span>
          <code className="font-mono text-[11px]">VITE_DEMO_SEED=0</code> — empty board on
          purpose.{" "}
          <Link to="/how-it-works" className="underline-offset-4 hover:underline">
            How it works
          </Link>
        </>
      )}
    </div>
  )
}
