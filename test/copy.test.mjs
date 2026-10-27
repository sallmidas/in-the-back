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
    "src/pages/StorePlansPage.tsx",
    "src/pages/StoresLandingPage.tsx",
    "src/pages/StoreLoginPage.tsx",
    "src/pages/StoreDashboardPage.tsx",
    "src/components/chair/StoreClaimsQueue.tsx",
    "src/pages/HowItWorksPage.tsx",
    "src/pages/PrivacyPage.tsx",
    "src/pages/TermsPage.tsx",
    "src/pages/ContentPolicyPage.tsx",
    "src/pages/DeleteAccountPage.tsx",
    "src/components/layout/EmptyState.tsx",
    "src/components/layout/DemoBanner.tsx",
    "src/components/layout/HoldNotice.tsx",
    "src/components/layout/AppShell.tsx",
    "src/components/layout/StoreShell.tsx",
  ].map(read)

  const ui = pages.join("\n")
  assert.doesNotMatch(
    ui,
    /from the README|VITE_DEMO_SEED|localStorage|perReport|published report|Stripe|Payouts|held until|\bLLC\b|practice the claim|\bstub\b/i,
  )
  assert.match(read("src/pages/WritePage.tsx"), /I was in this room\./)
  assert.doesNotMatch(read("src/pages/WorkplacePage.tsx"), /This is my queue/)
  assert.match(read("src/components/layout/EmptyState.tsx"), /File a report/)
  assert.match(read("src/pages/HowItWorksPage.tsx"), /Back of house/)
  assert.match(read("src/pages/HowItWorksPage.tsx"), /one seat for the whole platform/)
  assert.match(read("src/pages/StoresLandingPage.tsx"), /For stores & businesses/)
  assert.match(read("src/pages/StoresLandingPage.tsx"), /Claim your store/)
  assert.match(read("src/pages/StorePlansPage.tsx"), /Plans for stores/)
  assert.match(read("src/pages/StorePlansPage.tsx"), /Stores would pay for alerts/)
  assert.doesNotMatch(read("src/pages/StorePlansPage.tsx"), /facility|reporter would earn|File a report/)
  assert.doesNotMatch(read("src/pages/StoresLandingPage.tsx"), /facility|reporter would earn|File a report/)
  assert.match(read("src/components/layout/AppShell.tsx"), /Are you a store\?/)
  assert.doesNotMatch(read("src/data/plans.ts"), /facility|reporter would earn/)
  assert.match(read("src/pages/TermsPage.tsx"), /REPORTER_REWARD_NOTE/)
  assert.match(read("src/components/layout/DraftBanner.tsx"), /Draft – pending legal review/)
  assert.match(read("src/pages/PrivacyPage.tsx"), /<DraftBanner/)
  assert.match(read("src/pages/TermsPage.tsx"), /<DraftBanner/)
  assert.match(read("src/lib/contact.ts"), /contact@REPLACE-ME/)
  assert.match(read("src/components/layout/AppShell.tsx"), /HoldNotice/)
  assert.match(read("src/components/layout/AppShell.tsx"), /to="\/terms"/)
  assert.match(read("src/components/layout/AppShell.tsx"), /to="\/content"/)
  assert.doesNotMatch(read("src/pages/HomePage.tsx"), /<HoldNotice|harbor-and-rye/)
  assert.doesNotMatch(read("src/pages/StorePlansPage.tsx"), /HoldNotice/)
  assert.doesNotMatch(read("src/pages/HowItWorksPage.tsx"), /HoldNotice|harbor-and-rye|\/stores/)

  const plans = read("src/data/plans.ts")
  assert.match(plans, /storePriceLabel\(129\)/)
  assert.match(plans, /storePriceLabel\(249\)/)
  assert.doesNotMatch(plans, /perReport|kitchenPriceLabel/)
  assert.doesNotMatch(read("src/pages/StorePlansPage.tsx"), /\+ \{|perReport|published report/)
})

test("demo seed is off unless explicitly enabled", () => {
  assert.match(read("src/data/demo-flag.ts"), /VITE_DEMO_SEED === "1"/)
  assert.match(read("src/data/catalog.ts"), /@\/data\/seed/)
  assert.doesNotMatch(read("src/data/catalog.ts"), /from "\.\/seed"/)
  assert.match(read("vite.config.ts"), /seed\.empty\.ts/)
  assert.doesNotMatch(read(".env.example"), /^VITE_DEMO_SEED=1\s*$/m)
  assert.doesNotMatch(read("src/components/layout/HoldNotice.tsx"), /Harbor|harbor-and-rye/)
  assert.doesNotMatch(read("src/components/layout/AppShell.tsx"), /harbor-and-rye/)
})
