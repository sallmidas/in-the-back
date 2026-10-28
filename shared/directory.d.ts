export const RECORD_INDUSTRY_OPTIONS: { id: string; label: string }[]
export const RECORD_FILTERS: { id: string; label: string }[]
export const DIRECTORY_SORTS: { id: string; label: string }[]
export function placeRecords(workplace: { id: string; slug: string }, records: unknown[]): unknown[]
export function citationCount(records: unknown[]): number
export function wageCaseCount(records: unknown[]): number
export function moneyTotal(records: unknown[]): number
export function recordChip(workplace: { id: string; slug: string }, records: unknown[]): string
export function directoryTowns(workplaces: { city?: string }[]): string[]
export function filterAndSortWorkplaces(
  workplaces: unknown[],
  records: unknown[],
  filters?: Record<string, string | undefined>,
): unknown[]
