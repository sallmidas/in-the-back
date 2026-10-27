import assert from "node:assert/strict"
import test from "node:test"
import { PREVIEW_NOTE, REPORTER_REWARD_NOTE, kitchenPriceLabel } from "../shared/plan-copy.mjs"

test("planned prices name a reward only after review", () => {
  assert.equal(
    kitchenPriceLabel(129, 3),
    "The store pays $129/mo. A reporter would earn $3 once the report passes review. Reports shown to be false after a dispute earn nothing.",
  )
  assert.equal(
    kitchenPriceLabel(249, 5),
    "The store pays $249/mo. A reporter would earn $5 once the report passes review. Reports shown to be false after a dispute earn nothing.",
  )
  assert.equal(kitchenPriceLabel(0, 0), "Free for everyone reading and filing.")
  assert.equal(
    REPORTER_REWARD_NOTE,
    "Planned: reporters earn a small reward once their report passes review. Reports shown to be false after a dispute earn nothing.",
  )
  assert.equal(
    PREVIEW_NOTE,
    "Pricing and reporter rewards are planned for later; In the Back is free during the preview.",
  )
  assert.doesNotMatch(kitchenPriceLabel(129, 3), /\+|per report|toll|payout|held until|for each published/i)
})
