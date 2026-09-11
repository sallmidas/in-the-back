import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { documentTitleForPath } from "@/lib/document-title"

export function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = documentTitleForPath(pathname)
  }, [pathname])

  return null
}
