import { Link } from "react-router-dom"

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 text-foreground">
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden
      >
        <rect x="1.5" y="4" width="13" height="24" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="17.5" y="4" width="13" height="24" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12.2" cy="16" r="1.1" fill="currentColor" />
        <circle cx="19.8" cy="16" r="1.1" fill="currentColor" />
        <path d="M8 8h4M20 8h4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="leading-tight">
        <span className="font-heading block text-lg tracking-tight">In the Back</span>
        {compact ? null : (
          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:block">
            BOH rooms, not résumés
          </span>
        )}
      </span>
    </Link>
  )
}
