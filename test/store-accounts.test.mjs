import assert from "node:assert/strict"
import test from "node:test"
import { apiClient, sampleFiling, withServer } from "./helpers.mjs"

async function register(client, email, password, kind) {
  return client.request("POST", "/api/auth/register", { email, password, kind })
}

test("a store account is a separate sign-in and cannot claim the chair", async () => {
  await withServer(async ({ base, client }) => {
    const store = await register(client, "desk@northkitchen.example", "store-password", "store")
    assert.equal(store.status, 201)
    assert.equal(store.data.user.kind, "store")
    assert.equal(store.data.chair.mine, false)

    const chairAttempt = await client.request("POST", "/api/chair/claim", {})
    assert.equal(chairAttempt.status, 403)
    assert.match(chairAttempt.data.error, /cannot claim the platform chair/i)

    await client.request("POST", "/api/auth/logout", {})
    const reader = apiClient(base)
    const created = await register(reader, "reader@example.com", "reader-password", "reader")
    assert.equal(created.status, 201)
    assert.equal(created.data.user.kind, "reader")

    const asStore = await reader.request("POST", "/api/auth/login", {
      email: "reader@example.com",
      password: "reader-password",
      kind: "store",
    })
    assert.equal(asStore.status, 401)
    assert.match(asStore.data.error, /reader account/i)

    const wrong = await reader.request("POST", "/api/auth/login", {
      email: "reader@example.com",
      password: "not-the-password",
      kind: "store",
    })
    assert.equal(wrong.status, 401)
    assert.match(wrong.data.error, /wrong/i)
    assert.doesNotMatch(wrong.data.error, /reader account/i)

    const storeDoor = apiClient(base)
    const crossed = await storeDoor.request("POST", "/api/auth/login", {
      email: "desk@northkitchen.example",
      password: "store-password",
      kind: "reader",
    })
    assert.equal(crossed.status, 401)
    assert.match(crossed.data.error, /store account/i)

    const storeLogin = await storeDoor.request("POST", "/api/auth/login", {
      email: "desk@northkitchen.example",
      password: "store-password",
      kind: "store",
    })
    assert.equal(storeLogin.status, 200)
    assert.equal(storeLogin.data.user.kind, "store")

    const duplicate = await reader.request("POST", "/api/auth/register", {
      email: "desk@northkitchen.example",
      password: "reader-password",
      kind: "reader",
    })
    assert.equal(duplicate.status, 409)
  })
})

test("a store claim stays pending until the chair approves it", async () => {
  await withServer(async ({ base }) => {
    const filerEmail = "filer-secret@example.com"
    const filer = apiClient(base)
    await register(filer, filerEmail, "filer-password", "reader")
    const filed = await filer.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)

    const store = apiClient(base)
    await register(store, "desk@northkitchen.example", "store-password", "store")
    const named = await store.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "Manager James",
      workEmail: "desk@northkitchen.example",
    })
    assert.equal(named.status, 400)
    assert.match(named.data.error, /job title/i)

    const pending = await store.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "General manager",
      workEmail: "desk@northkitchen.example",
    })
    assert.equal(pending.status, 201)
    assert.equal(pending.data.claim.status, "pending")
    assert.equal(pending.data.claim.freeInbox, false)

    const home = await store.request("GET", "/api/store/home")
    assert.equal(home.status, 200)
    assert.equal(home.data.claim.status, "pending")
    assert.equal(home.data.stores.length, 0)
    assert.equal(JSON.stringify(home.data).includes(filerEmail), false)
    assert.equal(JSON.stringify(home.data).includes("ownerUserId"), false)

    const again = await store.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "Owner",
      workEmail: "desk@northkitchen.example",
    })
    assert.equal(again.status, 409)

    const reader = apiClient(base)
    await register(reader, "reader@example.com", "reader-password", "reader")
    const refused = await reader.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "Owner",
      workEmail: "reader@example.com",
    })
    assert.equal(refused.status, 401)

    const peek = await reader.request("GET", "/api/chair/store-claims")
    assert.equal(peek.status, 403)

    const chair = apiClient(base)
    await register(chair, "chair@example.com", "chair-password", "reader")
    await chair.request("POST", "/api/chair/claim", {})
    const queue = await chair.request("GET", "/api/chair/store-claims")
    assert.equal(queue.status, 200)
    assert.equal(queue.data.claims.length, 1)
    assert.equal(queue.data.claims[0].status, "pending")
    assert.equal(queue.data.claims[0].workEmail, "desk@northkitchen.example")
    assert.equal(JSON.stringify(queue.data).includes(filerEmail), false)

    const approved = await chair.request("POST", "/api/chair/store-claims/approve", {
      claimId: pending.data.claim.id,
    })
    assert.equal(approved.status, 200)
    assert.equal(approved.data.claim.status, "approved")

    const dash = await store.request("GET", "/api/store/home")
    assert.equal(dash.data.stores.length, 1)
    assert.equal(dash.data.stores[0].workplace.name, "North Kitchen")
    assert.equal(dash.data.stores[0].reports.length, 1)
    assert.equal(dash.data.stores[0].reports[0].excerpt, sampleFiling.excerpt)
    assert.equal(dash.data.stores[0].workplace.rooms.length, 1)
    const packed = JSON.stringify(dash.data)
    assert.equal(packed.includes(filerEmail), false)
    assert.equal(packed.includes("receipt"), false)
    assert.equal(packed.includes("ownerUserId"), false)

    const second = apiClient(base)
    await register(second, "ops@northkitchen.example", "second-password", "store")
    const secondClaim = await second.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "Owner",
      workEmail: "ops@northkitchen.example",
    })
    assert.equal(secondClaim.status, 201)
    const blocked = await chair.request("POST", "/api/chair/store-claims/approve", {
      claimId: secondClaim.data.claim.id,
    })
    assert.equal(blocked.status, 409)
    assert.match(blocked.data.error, /already has a verified claim/i)
    const added = await chair.request("POST", "/api/chair/store-claims/approve", {
      claimId: secondClaim.data.claim.id,
      allowAnother: true,
    })
    assert.equal(added.status, 200)
    const secondHome = await second.request("GET", "/api/store/home")
    assert.equal(secondHome.data.stores[0].reports.length, 1)
    assert.equal(JSON.stringify(secondHome.data).includes(filerEmail), false)

    const gmail = apiClient(base)
    await register(gmail, "someone@gmail.com", "gmail-password", "store")
    const flagged = await gmail.request("POST", "/api/store/claims", {
      businessName: "Other Counter",
      role: "Owner",
      workEmail: "someone@gmail.com",
    })
    assert.equal(flagged.status, 201)
    assert.equal(flagged.data.claim.freeInbox, true)
    assert.equal(flagged.data.claim.status, "pending")
  })
})

test("a store cannot hide or delete a filing", async () => {
  await withServer(async ({ base, client }) => {
    const filed = await client.request("POST", "/api/reports", sampleFiling)
    assert.equal(filed.status, 201)
    const id = filed.data.report.id

    const store = apiClient(base)
    await register(store, "desk@northkitchen.example", "store-password", "store")
    await store.request("POST", "/api/store/claims", {
      businessName: "North Kitchen",
      role: "General manager",
      workEmail: "desk@northkitchen.example",
    })

    const hidden = await store.request("POST", "/api/chair/reports/hide", { reportId: id })
    assert.equal(hidden.status, 403)
    const unhidden = await store.request("POST", "/api/chair/reports/unhide", { reportId: id })
    assert.equal(unhidden.status, 403)
    const queue = await store.request("GET", "/api/chair/reports")
    assert.equal(queue.status, 403)
    const deleted = await store.request("DELETE", `/api/reports/${id}`)
    assert.equal(deleted.status, 405)
    assert.match(deleted.data.error, /cannot be deleted/i)
    const retracted = await store.request("POST", "/api/me/reports/retract", { reportId: id })
    assert.equal(retracted.status, 404)

    const board = await store.request("GET", "/api/board")
    assert.equal(board.data.reports.length, 1)
    assert.equal(board.data.reports[0].id, id)
  })
})
