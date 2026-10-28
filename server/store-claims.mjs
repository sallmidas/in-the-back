import { personalNameHit } from "../shared/names.mjs"
import { parseEmail } from "./validate.mjs"

const FREE_INBOX = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
])

function asText(value) {
  if (typeof value !== "string") return ""
  return value.split("\0").join("").replace(/\s+/g, " ").trim()
}

export function workEmailOnFreeInbox(email) {
  const domain = email.split("@")[1] ?? ""
  return FREE_INBOX.has(domain)
}

export function parseStoreClaim(body) {
  const businessName = asText(body?.businessName)
  const role = asText(body?.role)
  const workEmail = parseEmail(body?.workEmail)

  if (!businessName || businessName.length > 80) return { error: "Name the store." }
  if (businessName.length < 2) return { error: "Name the store." }
  if (!role || role.length > 80) {
    return { error: "Name your role. Use a title, not a person’s name." }
  }
  if (!workEmail) return { error: "Enter a work email." }

  if (personalNameHit(businessName, { solo: false }) || personalNameHit(role)) {
    return { error: "Use a job title, not a person’s name." }
  }

  return {
    value: {
      businessName,
      role,
      workEmail,
      freeInbox: workEmailOnFreeInbox(workEmail),
    },
  }
}
