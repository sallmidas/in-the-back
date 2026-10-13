import assert from "node:assert/strict"
import test from "node:test"
import { filingNameError, personalNameHit } from "../shared/names.mjs"

test("allows room writing without a person", () => {
  const excerpt =
    "Walk-in was 48 degrees. Dairy on the floor. Nobody logged a temp all close."
  assert.equal(personalNameHit(excerpt), null)
  assert.equal(personalNameHit("Tuesday close · prep"), null)
  assert.equal(personalNameHit("The line was short and the pit flooded by 11."), null)
  assert.equal(personalNameHit("Server room door sticks. Not a person."), null)
  assert.equal(
    filingNameError({
      workplaceName: "Harbor & Rye",
      city: "Portland",
      region: "OR",
      context: "Saturday dinner · line",
      excerpt,
    }),
    null,
  )
})

test("blocks personal names and emails", () => {
  assert.equal(personalNameHit("John Smith left the walk-in open."), "pair")
  assert.equal(personalNameHit("my name is Ana"), "phrase")
  assert.equal(personalNameHit("Chef Maria skipped the temp log."), "role")
  assert.equal(personalNameHit("Mr. Alvarez was on the line."), "title")
  assert.equal(personalNameHit("write me at sam@example.com"), "email")
  assert.equal(personalNameHit("JOHN SMITH ran the pass."), "caps")
  assert.equal(personalNameHit("Maria left the walk-in open."), "solo")
  assert.equal(personalNameHit("J. Smith was on the line."), "initial")
  assert.equal(personalNameHit("J.S. skipped the temp log."), "initial")
  assert.ok(filingNameError({ workplaceName: "Harbor & Rye", context: "close", excerpt: "Maria left the box open." }))
})

test("does not treat a single lowercase given name as proof", () => {
  assert.equal(personalNameHit("maria forgot the temp log"), null)
  assert.equal(personalNameHit("Mark the sheet pans before close."), null)
  assert.equal(personalNameHit("Long shift on the dock. Mats stayed wet."), null)
  assert.equal(personalNameHit("A.M. close. Nobody logged a temp."), null)
  assert.equal(personalNameHit("A.C. was out. The walk-in stayed warm."), null)
  assert.equal(personalNameHit("J Smith was on the line."), "initial")
})
