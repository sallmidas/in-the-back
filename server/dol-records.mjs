import { filterLaunchRows, rowsToRecords } from "./public-records.mjs"

const DATASETS = {
  osha: { agency: "OSHA", resource: "inspection", stateField: "site_state" },
  whd: { agency: "WHD", resource: "enforcement", stateField: "st_cd" },
}

export function dolKey() {
  const key = process.env.DOL_API_KEY
  return typeof key === "string" && key.trim() ? key.trim() : ""
}

function pageRows(body) {
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.results)) return body.results
  return []
}

/**
 * Download one DOL dataset. Without a key, returns a clear miss and no rows.
 * A failed filter does not fall through to the full national file.
 */
export async function fetchDolDataset({ source, key, fetchImpl = fetch, pageLimit = 20 } = {}) {
  const spec = DATASETS[source]
  if (!spec) return { ok: false, reason: "unknown-source", rows: [] }
  if (!key) {
    return {
      ok: false,
      reason: "missing-key",
      message:
        "DOL_API_KEY is unset. The DOL data portal requires a key for OSHA and Wage and Hour downloads. Pass a bulk CSV instead. Nothing was written.",
      rows: [],
    }
  }
  const rows = []
  const limit = 1000
  for (let page = 0; page < pageLimit; page += 1) {
    const url = new URL(`https://apiprod.dol.gov/v4/get/${spec.agency}/${spec.resource}/json`)
    url.searchParams.set("X-API-KEY", key)
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("offset", String(page * limit))
    url.searchParams.set("filter_object", JSON.stringify({ [spec.stateField]: "MA" }))
    let response
    try {
      response = await fetchImpl(url, { headers: { accept: "application/json" } })
    } catch (error) {
      return {
        ok: false,
        reason: "network",
        message: error instanceof Error ? error.message : "The DOL portal did not answer.",
        rows: [],
      }
    }
    if (!response.ok) {
      const detail = await response.text()
      return {
        ok: false,
        reason: "api",
        message: `DOL API ${response.status} for ${source}. ${detail.slice(0, 240)} Download a CSV from the portal and pass it to the importer.`,
        rows: [],
      }
    }
    const body = await response.json()
    const chunk = pageRows(body)
    rows.push(...chunk)
    if (chunk.length < limit) break
  }
  return { ok: true, rows }
}

export function recordsFromDolRows(rows, source) {
  const local = filterLaunchRows(rows, source)
  const parsed = rowsToRecords(local, source)
  return { ...parsed, skipped: parsed.skipped + (rows.length - local.length) }
}
