import type { PublicRecord } from "@/lib/api"

export const GRAVITY_LEGEND =
  "Serious means it could cause serious injury. Minor is other-than-serious. Willful means the rule was knowingly ignored. Repeat means the same violation was cited before."

export const CITATION_NOTE =
  "A citation is an agency finding, not a criminal conviction. Some are contested or reduced later. Source links show the official record."

export const WAGE_NOTE = "Back wages are the pay the agency found was owed."

export function findingNotes(records: { outcome?: string; sourceAgency?: string }[]) {
  const findings = records.filter((record) => record.outcome !== "clear" && record.outcome !== "recognition")
  const osha = findings.some((record) => record.sourceAgency === "osha")
  const wage = findings.some((record) => record.sourceAgency === "whd" || record.sourceAgency === "ma-ag")
  return { osha, wageOnly: wage && !osha }
}

export function splitRecords(records: PublicRecord[]) {
  return {
    good: records.filter((record) => record.outcome === "clear" || record.outcome === "recognition"),
    findings: records.filter((record) => record.outcome !== "clear" && record.outcome !== "recognition"),
  }
}
