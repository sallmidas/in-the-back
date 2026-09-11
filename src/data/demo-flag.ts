/**
 * DEMO seed switch.
 *
 * Default: the ten labeled sample workplaces are visible.
 * For a real launch with an empty directory:
 *   1. Set VITE_DEMO_SEED=0 in `.env.local`, or
 *   2. Empty the arrays in `src/data/seed.ts`.
 *
 * See README → “Strip the demo seed”.
 */
export function isDemoSeedEnabled(): boolean {
  return import.meta.env.VITE_DEMO_SEED !== "0"
}
