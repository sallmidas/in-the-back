import path from "node:path"
import { createStore } from "../server/store.mjs"
import { dolKey, fetchDolDataset, recordsFromDolRows } from "../server/dol-records.mjs"
import { defaultMaxAgeYears, importPublicRows } from "../server/public-records.mjs"
import { readTable } from "../server/tabular.mjs"

function arg(name) {
  const index = process.argv.indexOf(name)
  if (index === -1) return ""
  return process.argv[index + 1] ?? ""
}

const oshaCsv = arg("--osha-csv")
const whdCsv = arg("--whd-csv")
const key = dolKey()
const storePath = process.env.ITB_STORE_PATH || path.join(process.cwd(), "data", "board.json")
const store = createStore(storePath)
const jobs = [
  ["osha", oshaCsv],
  ["whd", whdCsv],
]

if (!key && !oshaCsv && !whdCsv) {
  console.log(
    "DOL_API_KEY is unset. The DOL data portal requires a key for OSHA and Wage and Hour downloads. Pass --osha-csv and --whd-csv if you already have a bulk export. Nothing was written.",
  )
  process.exit(0)
}

let failed = false
for (const [source, csvPath] of jobs) {
  let rows = null
  if (csvPath) {
    rows = await readTable(path.resolve(csvPath))
  } else if (key) {
    const pulled = await fetchDolDataset({ source, key })
    if (!pulled.ok) {
      console.error(pulled.message)
      failed = true
      continue
    }
    rows = pulled.rows
  } else {
    console.log(`No ${source} CSV and no DOL_API_KEY. Skipped ${source}.`)
    continue
  }
  const parsed = recordsFromDolRows(rows, source)
  if (parsed.error) {
    console.error(parsed.error)
    failed = true
    continue
  }
  const result = await importPublicRows(store, parsed.records.map(toCsvShape), source, {
    maxAgeYears: defaultMaxAgeYears(),
  })
  if (result.error) {
    console.error(result.error)
    failed = true
    continue
  }
  console.log(
    `${source}: ${result.added} added, ${result.updated} updated, ${result.skipped + parsed.skipped} skipped.`,
  )
}

if (failed) process.exit(1)

function toCsvShape(record) {
  return {
    record_id: record.recordId,
    record_date: record.recordDate,
    street: record.street,
    city: record.city,
    state: record.region,
    zip: record.zip,
    business_name: record.businessName,
    summary: record.summary,
    back_wages: record.backWages ?? "",
    penalty: record.penalty ?? "",
    status: record.status,
    source_url: record.sourceUrl,
    record_type: record.recordType,
    naics: record.naics ?? "",
  }
}
