import assert from "node:assert/strict"
import test from "node:test"
import { kitchenPriceLabel } from "../shared/plan-copy.mjs"

test("kitchen prices are flat and include reporter pay", () => {
  assert.equal(
    kitchenPriceLabel(129, 3),
    "Flat $129/mo · includes $3 to the reporter for each published file",
  )
  assert.equal(
    kitchenPriceLabel(249, 5),
    "Flat $249/mo · includes $5 to the reporter for each published file",
  )
  assert.equal(kitchenPriceLabel(0, 0), "No subscription. Looking at the board costs nothing.")
  assert.doesNotMatch(kitchenPriceLabel(129, 3), /\+|per report|toll|\/ published report/i)
})
