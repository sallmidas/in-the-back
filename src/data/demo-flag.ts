/**
 * DEMO seed switch.
 *
 * Default: the ten labeled sample workplaces are visible.
 * For a real launch with an empty directory (fast path):
 *   1. Copy `.env.example` to `.env.local`
 *   2. Set VITE_DEMO_SEED=0
 *   3. Restart `npm run dev`
 *
 * Hard path: empty the arrays in `src/data/seed.ts`.
 *
 * Home, directory, workplace 404, and the platform-chair queue render empty-catalog states
 * when this is off. See README → “Strip the demo seed”.
 */
export function isDemoSeedEnabled(): boolean {
  return import.meta.env.VITE_DEMO_SEED !== "0"
}
