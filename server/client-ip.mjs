const HOP_MAX = 16

/**
 * Express-style trust-proxy hop count.
 * 0 means ignore X-Forwarded-For and use the socket address.
 * N means trust N proxies: the client is N hops from the right of
 * (X-Forwarded-For entries, then the socket address).
 */
export function trustedProxyHops(env = process.env) {
  const raw = String(env.ITB_TRUST_PROXY ?? "").trim().toLowerCase()
  if (!raw || raw === "0" || raw === "false" || raw === "off" || raw === "no") return 0
  if (raw === "true" || raw === "yes" || raw === "on") return 1
  if (!/^[0-9]+$/.test(raw)) return 0
  const hops = Number(raw)
  if (hops < 1 || hops > HOP_MAX) return 0
  return hops
}

export function clientAddress(req, env = process.env) {
  const socketIp = normalizeIp(req.socket?.remoteAddress) || "local"
  const hops = trustedProxyHops(env)
  if (hops <= 0) return socketIp

  const header = req.headers?.["x-forwarded-for"]
  const forwarded = Array.isArray(header) ? header.join(",") : typeof header === "string" ? header : ""
  const parts = forwarded
    .split(",")
    .map((item) => normalizeIp(item))
    .filter(Boolean)
  const chain = [...parts, socketIp]
  const index = Math.max(0, chain.length - 1 - hops)
  return chain[index] || socketIp
}

function normalizeIp(value) {
  if (typeof value !== "string") return ""
  let ip = value.trim()
  if (ip.startsWith("[") && ip.endsWith("]")) ip = ip.slice(1, -1)
  if (!ip || ip.length > 80) return ""
  if (ip.startsWith("::ffff:")) ip = ip.slice("::ffff:".length)
  if (ip === "::1") return "127.0.0.1"
  if (!/^[0-9a-fA-F:.]+$/.test(ip)) return ""
  return ip
}
