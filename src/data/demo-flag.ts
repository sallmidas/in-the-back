/**
 * DEMO seed switch. Off unless explicitly enabled.
 *
 * Sample workplaces are bundled only when this is exactly "1" at dev-server or build time:
 *   VITE_DEMO_SEED=1
 *
 * Unset, "0", or any other value keeps them out of the app. A production build
 * also swaps in an empty seed module, so the sample names are not in the bundle.
 */
export const demoSeedEnabled: boolean = import.meta.env.VITE_DEMO_SEED === "1"

export function isDemoSeedEnabled(): boolean {
  return demoSeedEnabled
}
