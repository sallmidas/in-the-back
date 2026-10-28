import path from "node:path"
import { createStore } from "../server/store.mjs"
import { defaultMaxAgeYears, importPublicRows } from "../server/public-records.mjs"
import { readTable } from "../server/tabular.mjs"

function arg(name) {
  const index = process.argv.indexOf(name)
  if (index === -1) return ""
  return process.argv[index + 1] ?? ""
}

const source = arg("--source")
const file = arg("--file")

if (!source || !file) {
  console.error("Usage: node scripts/import-public-records.mjs --source ma-ag|osha|whd|health --file records.csv")
  process.exit(1)
}

const storePath = process.env.ITB_STORE_PATH || path.join(process.cwd(), "data", "board.json")
const rows = await readTable(path.resolve(file))
const store = createStore(storePath)
const result = await importPublicRows(store, rows, source, { maxAgeYears: defaultMaxAgeYears() })
if (result.error) {
  console.error(result.error)
  process.exit(1)
}
console.log(
  `Imported ${source} from ${file}: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped. Store: ${storePath}`,
)
