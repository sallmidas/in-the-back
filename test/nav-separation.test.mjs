import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

function read(path) {
  return readFileSync(path, "utf8")
}

test("the reporter nav does not carry store pricing", () => {
  const shell = read("src/components/layout/AppShell.tsx")
  const home = read("src/pages/HomePage.tsx")
  const how = read("src/pages/HowItWorksPage.tsx")
  const empty = read("src/components/layout/EmptyState.tsx")

  assert.match(shell, /label: "Board"/)
  assert.match(shell, /label: "File a report"/)
  const reporterNav = shell.slice(shell.indexOf("const REPORTER_NAV"), shell.indexOf("const CHAIR_NAV"))
  assert.doesNotMatch(reporterNav, /\/staff|Chair/)
  assert.match(shell, /chair\.mine \? \[CHAIR_NAV\]/)
  assert.match(shell, /chair\.mine \? \(/)
  const staff = read("src/pages/StaffQueuePage.tsx")
  const claimAt = staff.indexOf("This is my queue")
  const gateAt = staff.indexOf("chair.canClaim")
  assert.ok(gateAt >= 0)
  assert.ok(claimAt > gateAt)
  assert.match(staff, /Not found\./)
  assert.match(shell, /Are you a store\?/)
  assert.match(shell, /to="\/stores"/)
  assert.doesNotMatch(shell, /For stores|\/plans|Watch|Respond|\$129|\$249/)
  assert.doesNotMatch(home, /\/stores|\/plans|Watch|Respond|\$129/)
  assert.doesNotMatch(how, /\/stores|Watch|Respond|\$129/)
  assert.doesNotMatch(empty, /\/plans|\/stores|Browse plans/)
})

test("store pages and a logged-in store use the store nav", () => {
  const app = read("src/App.tsx")
  const store = read("src/components/layout/StoreShell.tsx")
  const plans = read("src/pages/StorePlansPage.tsx")

  assert.match(app, /pathname\.startsWith\("\/stores"\)/)
  assert.match(app, /user\?\.kind === "store"/)
  assert.match(app, /Navigate to="\/stores\/plans"/)
  assert.match(store, /\/stores\/dashboard/)
  assert.match(store, /\/stores\/plans/)
  assert.doesNotMatch(store, /File a report|\/write|reporter would earn|Are you a store/)
  assert.match(plans, /Plans for stores/)
  assert.match(read("src/data/plans.ts"), /The store pays \$129\/mo/)
  assert.doesNotMatch(plans, /reporter would earn|File a report|\/write/)
  assert.doesNotMatch(read("src/data/plans.ts"), /reporter would earn/)
  assert.match(read("src/pages/WritePage.tsx"), /kind === "store"/)
  assert.match(read("src/pages/WritePage.tsx"), /\/stores\/dashboard/)
})
