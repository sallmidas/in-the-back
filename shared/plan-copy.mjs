/**
 * Kitchen price is a flat monthly subscription.
 * The reporter amount is paid out of that subscription, not added on top.
 */
export function kitchenPriceLabel(monthly, reporterPay) {
  if (!monthly) return "No subscription. Looking at the board costs nothing."
  return `Flat $${monthly}/mo · includes $${reporterPay} to the reporter for each published file`
}
