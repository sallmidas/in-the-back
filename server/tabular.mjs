import { inflateRawSync } from "node:zlib"
import { readFile } from "node:fs/promises"
import path from "node:path"

export function parseCsv(text) {
  const source = String(text ?? "").replace(/^\uFEFF/, "")
  const rows = []
  let row = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i += 1
        } else quoted = false
      } else cell += ch
      continue
    }
    if (ch === '"') {
      quoted = true
      continue
    }
    if (ch === ",") {
      row.push(cell)
      cell = ""
      continue
    }
    if (ch === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }
    if (ch !== "\r") cell += ch
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  const filled = rows.filter((item) => item.some((value) => String(value).trim() !== ""))
  if (filled.length === 0) return []
  const headers = filled[0].map((header) => String(header).trim())
  return filled.slice(1).map((values) => {
    const record = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = values[index] ?? ""
    })
    return record
  })
}

function unzip(buffer) {
  const files = new Map()
  let offset = 0
  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break
    const flags = buffer.readUInt16LE(offset + 6)
    const method = buffer.readUInt16LE(offset + 8)
    let compSize = buffer.readUInt32LE(offset + 18)
    const nameLen = buffer.readUInt16LE(offset + 26)
    const extraLen = buffer.readUInt16LE(offset + 28)
    const nameStart = offset + 30
    const name = buffer.toString("utf8", nameStart, nameStart + nameLen)
    const dataStart = nameStart + nameLen + extraLen
    if (flags & 0x08 && compSize === 0) {
      throw new Error("This spreadsheet uses a zip layout the importer does not read. Save it as CSV.")
    }
    const compressed = buffer.subarray(dataStart, dataStart + compSize)
    const data = method === 0 ? Buffer.from(compressed) : inflateRawSync(compressed)
    files.set(name, data)
    offset = dataStart + compSize
  }
  return files
}

function decodeXml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function sharedStrings(xml) {
  const strings = []
  const items = xml.match(/<si\b[\s\S]*?<\/si>/g) ?? []
  for (const item of items) {
    const parts = [...item.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1]))
    strings.push(parts.join(""))
  }
  return strings
}

function columnIndex(cellRef) {
  const letters = String(cellRef ?? "").replace(/[^A-Z]/gi, "").toUpperCase()
  let index = 0
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64)
  return index - 1
}

function parseSheet(xml, strings) {
  const rows = []
  const rowXml = xml.match(/<row\b[\s\S]*?<\/row>/g) ?? []
  for (const row of rowXml) {
    const values = []
    const cells = row.match(/<c\b[\s\S]*?<\/c>/g) ?? []
    for (const cell of cells) {
      const ref = cell.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? ""
      const type = cell.match(/\bt="([^"]+)"/)?.[1] ?? ""
      const index = columnIndex(ref)
      let text = ""
      if (type === "inlineStr") {
        text = [...cell.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join("")
      } else {
        const raw = cell.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? ""
        text = type === "s" ? strings[Number(raw)] ?? "" : decodeXml(raw)
      }
      if (index >= 0) values[index] = text
    }
    rows.push(values.map((value) => value ?? ""))
  }
  const filled = rows.filter((item) => item.some((value) => String(value).trim() !== ""))
  if (filled.length === 0) return []
  const width = Math.max(...filled.map((item) => item.length))
  const headers = Array.from({ length: width }, (_, index) => String(filled[0][index] ?? "").trim())
  return filled.slice(1).map((values) => {
    const record = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = values[index] ?? ""
    })
    return record
  })
}

export function parseXlsx(buffer) {
  const files = unzip(buffer)
  const shared = files.get("xl/sharedStrings.xml")
  const strings = shared ? sharedStrings(shared.toString("utf8")) : []
  const sheet =
    files.get("xl/worksheets/sheet1.xml") ??
    [...files.keys()].find((name) => /xl\/worksheets\/sheet\d+\.xml/.test(name))
  const sheetName = typeof sheet === "string" ? sheet : "xl/worksheets/sheet1.xml"
  const xml = files.get(sheetName)
  if (!xml) throw new Error("The spreadsheet has no sheet.")
  return parseSheet(xml.toString("utf8"), strings)
}

export async function readTable(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".csv" || ext === ".txt") return parseCsv(await readFile(filePath, "utf8"))
  if (ext === ".xlsx") return parseXlsx(await readFile(filePath))
  throw new Error("Use a .csv or .xlsx file.")
}
