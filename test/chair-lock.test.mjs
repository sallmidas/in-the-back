import assert from "node:assert/strict"
import test from "node:test"
import { apiClient, withServer } from "./helpers.mjs"

test("only the ITB_CHAIR_EMAIL account can claim, and a non-chair cannot", async () => {
  await withServer(async ({ base, client }) => {
    await client.request("POST", "/api/auth/register", {
      email: "other@example.com",
      password: "another-horse",
      kind: "reader",
    })
    const denied = await client.request("POST", "/api/chair/claim", {})
    assert.equal(denied.status, 404)
    assert.equal(denied.data.error, "Not found.")
    const otherMe = await client.request("GET", "/api/auth/me")
    assert.equal(otherMe.data.chair.canClaim, false)
    assert.equal(otherMe.data.chair.mine, false)
    assert.equal(otherMe.data.chair.open, false)
    assert.equal(JSON.stringify(otherMe.data).includes("saul@example.com"), false)

    const store = apiClient(base)
    await store.request("POST", "/api/auth/register", {
      email: "desk@northkitchen.example",
      password: "store-password",
      kind: "store",
    })
    const storeClaim = await store.request("POST", "/api/chair/claim", {})
    assert.equal(storeClaim.status, 404)
    assert.equal(storeClaim.data.error, "Not found.")

    const allowed = apiClient(base)
    const registered = await allowed.request("POST", "/api/auth/register", {
      email: "saul@example.com",
      password: "correct-horse",
      kind: "reader",
    })
    assert.equal(registered.status, 201)
    assert.equal(registered.data.chair.canClaim, true)
    const claim = await allowed.request("POST", "/api/chair/claim", {})
    assert.equal(claim.status, 200)
    assert.equal(claim.data.chair.mine, true)

    const again = await allowed.request("POST", "/api/chair/claim", {})
    assert.equal(again.status, 200)
    assert.equal(again.data.chair.mine, true)

    const stillDenied = await client.request("POST", "/api/chair/claim", {})
    assert.equal(stillDenied.status, 404)
    assert.equal(stillDenied.data.error, "Not found.")
    const after = await client.request("GET", "/api/auth/me")
    assert.equal(after.data.chair.claimed, true)
    assert.equal(after.data.chair.mine, false)
    assert.equal(after.data.chair.canClaim, false)
  }, { chairEmail: "Saul@Example.com" })
})

test("production with ITB_CHAIR_EMAIL still lets that account claim once", async () => {
  await withServer(async ({ base, client }) => {
    await client.request("POST", "/api/auth/register", {
      email: "saul@example.com",
      password: "correct-horse",
    })
    const claim = await client.request("POST", "/api/chair/claim", {})
    assert.equal(claim.status, 200)
    assert.equal(claim.data.chair.mine, true)

    const other = apiClient(base)
    await other.request("POST", "/api/auth/register", {
      email: "other@example.com",
      password: "another-horse",
    })
    const refused = await other.request("POST", "/api/chair/claim", {})
    assert.equal(refused.status, 404)
    assert.equal(refused.data.error, "Not found.")
  }, { production: true, chairEmail: "saul@example.com" })
})

test("production without ITB_CHAIR_EMAIL blocks every claim and logs a warning", async () => {
  const warnings = []
  const original = console.warn
  console.warn = (...args) => {
    warnings.push(args.map(String).join(" "))
  }
  try {
    await withServer(async ({ client }) => {
      await client.request("POST", "/api/auth/register", {
        email: "saul@example.com",
        password: "correct-horse",
      })
      const me = await client.request("GET", "/api/auth/me")
      assert.equal(me.data.chair.canClaim, false)
      assert.equal(me.data.chair.open, false)
      const claim = await client.request("POST", "/api/chair/claim", {})
      assert.equal(claim.status, 403)
      assert.equal(claim.data.error, "Not found.")
      const after = await client.request("GET", "/api/auth/me")
      assert.equal(after.data.chair.claimed, false)
      assert.equal(after.data.chair.mine, false)
    }, { production: true })
  } finally {
    console.warn = original
  }
  assert.match(warnings.join("\n"), /ITB_CHAIR_EMAIL is unset\. Nobody can claim the platform chair\./)
})
