import type { PublicRecord } from "@/lib/api"

export const CITATION_NOTE =
  "A citation is an agency finding, not a criminal conviction. Some are contested or reduced later. Source links show the official record."

export function splitRecords(records: PublicRecord[]) {
  return {
    good: records.filter((record) => record.outcome === "clear" || record.outcome === "recognition"),
    findings: records.filter((record) => record.outcome !== "clear" && record.outcome !== "recognition"),
  }
}
