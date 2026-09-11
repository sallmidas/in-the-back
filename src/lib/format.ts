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
  if (amount === 0) return "$0"
  return `$${amount.toLocaleString("en-US")}`
}
