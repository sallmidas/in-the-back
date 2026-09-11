import { getWorkplaceBySlug } from "@/data/catalog"

export const SITE_NAME = "In the Back"
export const SITE_SLOGAN = "Cleanliness, safety, dignity — scored"
export const DEFAULT_DOCUMENT_TITLE = `${SITE_NAME} — ${SITE_SLOGAN}`

const STATIC_TITLES: Record<string, string> = {
  "/": DEFAULT_DOCUMENT_TITLE,
  "/workplaces": `Directory · ${SITE_NAME}`,
  "/how-it-works": `How it works · ${SITE_NAME}`,
  "/plans": `Plans · ${SITE_NAME}`,
  "/staff": `This is my queue · ${SITE_NAME}`,
  "/write": `Filing held · ${SITE_NAME}`,
  "/privacy": `Privacy · ${SITE_NAME}`,
  "/account/delete": `Delete account · ${SITE_NAME}`,
}

/** Tab titles only. Never chair email, excerpts, or query strings — HashRouter shares the same pathname. */
export function documentTitleForPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/"
  if (path in STATIC_TITLES) return STATIC_TITLES[path]

  if (path.startsWith("/workplaces/")) {
    const slug = path.slice("/workplaces/".length)
    if (!slug.includes("/")) {
      const workplace = getWorkplaceBySlug(slug)
      if (workplace) return `${workplace.name} · ${SITE_NAME}`
    }
    return `No board for this place · ${SITE_NAME}`
  }

  return `Not on this board · ${SITE_NAME}`
}
