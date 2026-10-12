import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useBoard } from "@/lib/board"
import { documentTitleForPath } from "@/lib/document-title"

export function DocumentTitle() {
  const { pathname } = useLocation()
  const board = useBoard()
  const slug = pathname.startsWith("/workplaces/")
    ? pathname.replace(/\/+$/, "").slice("/workplaces/".length)
    : ""
  const workplaceName = slug && !slug.includes("/") ? board.workplaceBySlug(slug)?.name ?? null : undefined

  useEffect(() => {
    if (slug && !board.ready) return
    document.title = documentTitleForPath(pathname, workplaceName)
  }, [pathname, slug, board.ready, workplaceName])

  return null
}
