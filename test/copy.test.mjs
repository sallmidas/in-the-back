import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

function read(path) {
  return readFileSync(path, "utf8")
}

test("user-facing copy matches the product model", () => {
  const pages = [
    "src/pages/HomePage.tsx",
    "src/pages/DirectoryPage.tsx",
    "src/pages/WorkplacePage.tsx",
    "src/pages/WritePage.tsx",
    "src/pages/StaffQueuePage.tsx",
    "src/pages/PlansPage.tsx",
    "src/pages/HowItWorksPage.tsx",
    "src/components/layout/EmptyState.tsx",
    "src/components/layout/DemoBanner.tsx",
    "src/components/layout/AppShell.tsx",
  ].map(read)

  const ui = pages.join("\n")
  assert.doesNotMatch(ui, /from the README|VITE_DEMO_SEED|localStorage|perReport|published report/)
  assert.doesNotMatch(read("src/pages/WorkplacePage.tsx"), /This is my queue/)
  assert.match(read("src/components/layout/EmptyState.tsx"), /File a report/)
  assert.match(read("src/pages/HowItWorksPage.tsx"), /Back of house/)
  assert.match(read("src/pages/HowItWorksPage.tsx"), /one seat for the whole platform/)

  const plans = read("src/data/plans.ts")
  assert.match(plans, /kitchenPriceLabel\(129, 3\)/)
  assert.match(plans, /kitchenPriceLabel\(249, 5\)/)
  assert.doesNotMatch(plans, /perReport/)
  assert.doesNotMatch(read("src/pages/PlansPage.tsx"), /\+ \{|perReport|published report/)
})
