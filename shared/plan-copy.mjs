/**
 * One neutral line for the preview. Prices below are a later model, not a bill and not a promise.
 */
export const PREVIEW_NOTE =
  "Pricing and reporter rewards are planned for later; In the Back is free during the preview."

/**
 * Planned reward rule. Filing alone does not earn it.
 * A dispute that shows the report is false earns nothing.
 */
export const REPORTER_REWARD_NOTE =
  "Planned: reporters earn a small reward once their report passes review. Reports shown to be false after a dispute earn nothing."

/**
 * Kitchen price is a flat monthly subscription in the planned model.
 * The reporter amount would come out of that subscription, not on top of it,
 * and only after review. A false report after a dispute would earn nothing.
 * Nothing here is charged or paid during the preview.
 */
export function kitchenPriceLabel(monthly, reporterPay) {
  if (!monthly) return "Free during the preview. Looking at the board costs nothing."
  return `Planned, coming later: $${monthly}/mo. A reporter would earn $${reporterPay} once the report passes review. Reports shown to be false after a dispute earn nothing.`
}
