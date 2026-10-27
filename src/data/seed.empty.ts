import type { Report, Workplace } from "./types"

/**
 * Stand-in for `seed.ts` when the demo is not explicitly enabled.
 * Vite aliases `@/data/seed` here so a production build does not contain sample workplaces.
 */
export const DEMO_WORKPLACES: Workplace[] = []
export const DEMO_REPORTS: Report[] = []
