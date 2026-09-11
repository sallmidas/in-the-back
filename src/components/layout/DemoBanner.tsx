import { Link } from "react-router-dom"

export function DemoBanner() {
  return (
    <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm text-primary">
      <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Demo seed</span>
      <span className="mx-2 text-primary/40">/</span>
      Sample board only. Filing and billing held until LLC.{" "}
      <Link to="/#demo-walk" className="underline-offset-4 hover:underline">
        Walk the demo
      </Link>
    </div>
  )
}
