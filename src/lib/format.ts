export function formatScore(score: number): string {
  return score.toFixed(1).replace(/\.0$/, "")
}

export function scoreTone(score: number): "low" | "mid" | "high" | "top" {
  if (score <= 4.4) return "low"
  if (score <= 6.4) return "mid"
  if (score <= 8.4) return "high"
  return "top"
}

export function scoreClass(score: number): string {
  const tone = scoreTone(score)
  if (tone === "low") return "text-destructive"
  if (tone === "mid") return "text-primary"
  if (tone === "high") return "text-emerald-400"
  return "text-lime-300"
}

export function scoreRailClass(score: number): string {
  const tone = scoreTone(score)
  if (tone === "low") return "border-l-destructive"
  if (tone === "mid") return "border-l-primary"
  if (tone === "high") return "border-l-emerald-400"
  return "border-l-lime-300"
}

export function formatPublishedAt(iso: string): string {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 14) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  if (!Number.isFinite(rounded) || rounded === 0) return "$0"
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `$${text}`
}
