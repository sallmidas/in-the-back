import assert from "node:assert/strict"
import test from "node:test"
import { clientAddress, trustedProxyHops } from "../server/client-ip.mjs"

function req(socketIp, forwarded) {
  return {
    socket: { remoteAddress: socketIp },
    headers: forwarded === undefined ? {} : { "x-forwarded-for": forwarded },
  }
}

test("trust-proxy hops follow the env value", () => {
  assert.equal(trustedProxyHops({}), 0)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "0" }), 0)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "false" }), 0)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "1" }), 1)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "true" }), 1)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "2" }), 2)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "99" }), 0)
  assert.equal(trustedProxyHops({ ITB_TRUST_PROXY: "nope" }), 0)
})

test("the socket address is used until a proxy is trusted", () => {
  const request = req("::ffff:10.0.0.8", "203.0.113.5, 198.51.100.20")
  assert.equal(clientAddress(request, {}), "10.0.0.8")
  assert.equal(clientAddress(request, { ITB_TRUST_PROXY: "0" }), "10.0.0.8")
})

test("one trusted proxy uses the nearest forwarded address, not a spoofed left entry", () => {
  const request = req("10.0.0.8", "1.2.3.4, 203.0.113.5")
  assert.equal(clientAddress(request, { ITB_TRUST_PROXY: "1" }), "203.0.113.5")
  assert.equal(clientAddress(request, { ITB_TRUST_PROXY: "2" }), "1.2.3.4")
})

test("a missing forwarded header falls back to the socket", () => {
  assert.equal(clientAddress(req("127.0.0.1"), { ITB_TRUST_PROXY: "1" }), "127.0.0.1")
  assert.equal(clientAddress(req("::1"), { ITB_TRUST_PROXY: "1" }), "127.0.0.1")
})
