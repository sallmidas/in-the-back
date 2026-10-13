import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto"

function scryptN() {
  const configured = Number(process.env.ITB_SCRYPT_N || 16384)
  return Number.isFinite(configured) && configured >= 1024 ? configured : 16384
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 32, { N: scryptN(), r: 8, p: 1 }).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false
  const [algo, salt, hash] = stored.split("$")
  if (algo !== "scrypt" || !salt || !hash) return false
  const next = scryptSync(password, salt, 32, { N: scryptN(), r: 8, p: 1 })
  const prev = Buffer.from(hash, "hex")
  if (prev.length !== next.length) return false
  return timingSafeEqual(prev, next)
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex")
}

export function randomId(prefix) {
  return `${prefix}_${randomBytes(8).toString("hex")}`
}

export function randomToken() {
  return randomBytes(32).toString("base64url")
}

const RECEIPT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function randomReceipt() {
  const bytes = randomBytes(12)
  let raw = ""
  for (let i = 0; i < 12; i += 1) raw += RECEIPT_ALPHABET[bytes[i] % RECEIPT_ALPHABET.length]
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
}

export function normalizeReceipt(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

export function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length || a.length === 0) {
    return false
  }
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"))
}
