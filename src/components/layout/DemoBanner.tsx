import { Link } from "react-router-dom"

export function DemoBanner() {
  return (
    <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm text-primary">
      <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Demo seed</span>
      <span className="mx-2 text-primary/40">/</span>
      Labeled sample workplaces — not live reviews.{" "}
      <Link to="/workplaces" className="underline-offset-4 hover:underline">
        Directory
      </Link>
    </div>
  )
}
